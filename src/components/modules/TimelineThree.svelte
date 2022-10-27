<script lang="ts">
  import { onMount } from "svelte";
  import { throttle } from "underscore";

  import * as THREE from "three";
  import { OrbitControls } from "../../../node_modules/three/examples/jsm/controls/OrbitControls.js";

  import {
    media_store_filtered,
    events_store,
    ui_store,
    platform_config_store,
  } from "../../stores/store";

  // parameters
  let time_scale_factor = 0.00001;
  let scroll_percent_in = 15; // what percentage to cut off/add left + right when zooming in/out

  let videos, // videos coming in from store (currently set to filtered videos)
    videos_w_chrono, // array of video with chronolocation information
    timeBegin = 0, // date for beginning time of timeline,in ms since jan 1 1970
    timeEnd, // date for ending time of timeline,in ms since jan 1 1970
    time2x, // function to convert time in ms since jan 1 1970 to x coordinate in 3js space
    x2time, // inverse of time2x
    orderedByTime = true, // boolean whether video should be positioned vertically by time
    orderedOtherIndex = {}, // dictionary: a video's property value > vertical position
    free_time_at_row = [], // array containing, for every vertical row, when the latest video on that row ends
    video_y_position = []; // array containing, for every video, their vertical position

  let el, container;
  var ro = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const cr = entry.contentRect;
      canvasWidth = cr.width;
      canvasHeight = cr.height;
      renderer.setSize(canvasWidth, canvasHeight);
      camera.aspect = canvasWidth / canvasHeight;
      camera.updateProjectionMatrix();
    }
  });
  let mouse_dragged = false;
  let mouse_dragged_timeout;
  let initial_setup_done;

  let camera, scene, renderer, canvasWidth, canvasHeight;
  let mesh, white_material;
  const amount = 50;
  const count = Math.pow(amount, 3);
  const dummy = new THREE.Object3D();
  let mouse = new THREE.Vector2(1, 1);
  const raycaster = new THREE.Raycaster();

  onMount(() => {
    initial_setup_done = false;
    init(el);
    animate();
    ro.observe(container);
  });

  function init(el, container) {
    camera = new THREE.OrthographicCamera(-100, 100, 6, -1, 1, 5);
    camera.position.set(0, 0, 2);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    let geometry = new THREE.BoxGeometry();
    geometry.computeVertexNormals();

    white_material = new THREE.MeshBasicMaterial({
      color: "white",
    });
    mesh = new THREE.InstancedMesh(geometry, white_material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
    let color = new THREE.Color();
    new Array(count).fill(0).forEach((c, i) => {
      mesh.setColorAt(i, color.set(0xffffff));
    });

    scene.add(mesh);

    const controls = new OrbitControls(camera, el);
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
    };

    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el });

    renderer.setSize(container?.clientHeight, container?.clientWidth);
  }

  $: {
    timeBegin = new Date(
      $platform_config_store["Timeline begin datetime"]
    ).getTime();
    timeEnd = new Date(
      $platform_config_store["Timeline end datetime"]
    ).getTime();

    time2x = (time) => {
      return (time - timeBegin) * time_scale_factor;
    };

    x2time = (x) => {
      return (x + timeBegin) * time_scale_factor;
    };
  }

  $: {
    videos = Object.values($media_store_filtered);
    videos_w_chrono = videos
      .filter(
        (video) =>
          video.times !== undefined &&
          video.times[0].starting_time !== undefined &&
          video.times[0].ending_time !== undefined &&
          !isNaN(video.times[0].starting_time) &&
          !isNaN(video.times[0].ending_time)
      )
      .sort((a, b) => a.times[0].starting_time - b.times[0].starting_time);

    if (
      $platform_config_store["Assets ordering"] == undefined ||
      $platform_config_store["Title of column used for chronolocation"] ==
        $platform_config_store["Assets ordering"]
    ) {
      orderedByTime = true;

      //
      free_time_at_row = [];

      videos_w_chrono.forEach((video, v) => {
        let slotted_in = false;
        free_time_at_row.forEach((row_free_time, r) => {
          if (!slotted_in) {
            if (video.times[0].starting_time >= row_free_time) {
              slotted_in = true;
              video_y_position[v] = r;
              if (!isNaN(video.times[0].ending_time)) {
                free_time_at_row[r] = video.times[0].ending_time;
              }
            }
          }
        });
        if (!slotted_in) {
          let added_row;
          if (!isNaN(video.times[0].ending_time)) {
            added_row = video.times[0].ending_time;
          } else if (!isNaN(video.times[0].starting_time)) {
            added_row = video.times[0].starting_time;
          } else {
            added_row = 0;
          }
          free_time_at_row.push(added_row);
          video_y_position[v] = free_time_at_row.length;
        }
      });
    } else {
      orderedByTime = false;
      let unique_order_value = [
        ...new Set(
          videos_w_chrono.map(
            (video) => video[$platform_config_store["Assets ordering"]]
          )
        ),
      ].sort();
      unique_order_value.forEach((value, i) => {
        orderedOtherIndex[value] = i;
      });
    }
  }

  $: {
    if (camera && !initial_setup_done) {
      camera.left = time2x(timeBegin);
      camera.right = time2x(timeEnd);

      if (!orderedByTime) {
        camera.top = Math.max(...Object.values(orderedOtherIndex)) + 1;
        camera.bottom = Math.min(...Object.values(orderedOtherIndex)) - 1;
      } else {
        camera.top = free_time_at_row.length - 0.5;
        camera.bottom = -0.5;
      }
      camera.updateProjectionMatrix();
      if (videos.length > 0) initial_setup_done = true;
    }
  }

  const animate = () => {
    requestAnimationFrame(animate);
    render();
  };

  function render() {
    if (mesh) {
      let i = 0;

      new Array(count).fill(0).forEach((c, i) => {
        if (i < videos_w_chrono.length) {
          let video = videos_w_chrono[i];
          let duration =
            video.times[0].ending_time - video.times[0].starting_time;

          let y_position;
          if (orderedByTime) {
            y_position = video_y_position[i];
          } else {
            y_position =
              orderedOtherIndex[
                video[$platform_config_store["Assets ordering"]]
              ];
          }

          dummy.position.set(
            (video.times[0].starting_time - timeBegin) * time_scale_factor +
              0.5 * duration * time_scale_factor,
            y_position,
            0
          );

          dummy.scale.set(duration * time_scale_factor - 0.2, 0.95, 1);

          dummy.updateMatrix();

          if ($ui_store.media_in_view.includes(video.UAR)) {
            mesh.setColorAt(i, new THREE.Color(0xff0000));
          } else {
            mesh.setColorAt(i, new THREE.Color(0xffffff));
          }
          mesh.setMatrixAt(i, dummy.matrix);
          i += 1;
        } else {
          dummy.scale.set(0, 0, 0);
          mesh.setMatrixAt(i, dummy.matrix);
        }
      });

      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  function handleMouseMove(event) {
    mouse.x = (event.offsetX / canvasWidth) * 2 - 1;
    mouse.y = -(event.offsetY / canvasHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersection = raycaster.intersectObject(mesh);

    if (intersection.length > 0) {
      const instanceId = intersection[0].instanceId;
      $ui_store.media_hovered = [videos_w_chrono[instanceId].UAR];
    } else {
      $ui_store.media_hovered = [];
    }
  }

  let handleMouseMove_throttle = throttle(handleMouseMove, 200, {
    leading: true,
    trailing: false,
  });

  let handleMouseDown = () => {
    mouse_dragged_timeout = setTimeout(() => {
      mouse_dragged = true;
    }, 200);
  };

  let handleMouseUp = (event) => {
    clearTimeout(mouse_dragged_timeout);
    if (!mouse_dragged) {
      let UAR = identify_video(event);
      if (UAR) toggle_in_view(UAR);
    }
    mouse_dragged = false;
  };

  let identify_video = (event) => {
    mouse.x = (event.offsetX / canvasWidth) * 2 - 1;
    mouse.y = -(event.offsetY / canvasHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    let intersection = raycaster.intersectObject(mesh);
    if (intersection.length > 0) {
      const instanceId = intersection[0].instanceId;
      let UAR = videos_w_chrono[instanceId].UAR;
      return UAR;
    }

    return null;
  };

  let toggle_in_view = (UAR) => {
    if ($ui_store.media_in_view.includes(UAR)) {
      $ui_store.media_in_view = $ui_store.media_in_view.filter(
        (exist_UAR) => exist_UAR !== UAR
      );
    } else {
      $ui_store.media_in_view = [...$ui_store.media_in_view, UAR];
    }
  };

  let handleMouseLeave = () => {
    $ui_store.media_hovered = [];
  };

  let handleScroll = (event) => {
    let horizontal_range = camera.left - camera.right;
    camera.left += horizontal_range * 0.1 * Math.sign(event.wheelDelta);
    camera.right -= horizontal_range * 0.1 * Math.sign(event.wheelDelta);
    camera.updateProjectionMatrix();
  };
</script>

<div bind:this={container} on:mousewheel={handleScroll} id="timeline_container">
  <canvas
    bind:this={el}
    on:mousemove={handleMouseMove_throttle}
    on:mousedown={handleMouseDown}
    on:mouseup={handleMouseUp}
    on:mouseleave={handleMouseLeave}
  />
</div>

<style>
  #timeline_container {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  canvas {
    position: fixed;
    overflow: hidden;
  }
</style>
