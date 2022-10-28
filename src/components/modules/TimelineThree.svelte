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

      debug_renderer.setSize(canvasWidth, canvasHeight);
      debug_camera.aspect = canvasWidth / canvasHeight;
      debug_camera.updateProjectionMatrix();
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

  // debugging variables
  let debugging = true;
  let log_at_first = true;
  let debug_canvas, debug_camera, debug_renderer, cameraHelper;

  onMount(() => {
    initial_setup_done = false;
    init(el, container);
    animate();
    ro.observe(container);
  });

  function init(el, container) {
    // make camera
    camera = new THREE.OrthographicCamera(-10, 10, 6, -1, 1, 5);
    camera.position.set(0, 0, 2);

    // make videos container object
    // geometry
    let geometry = new THREE.BoxGeometry();
    geometry.computeVertexNormals();
    // material
    white_material = new THREE.MeshBasicMaterial({ color: "white" });
    mesh = new THREE.InstancedMesh(geometry, white_material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
    let color = new THREE.Color();
    new Array(count).fill(0).forEach((c, i) => {
      mesh.setColorAt(i, color.set(0xffffff));
    });

    // make scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.add(mesh);

    // make controls
    const controls = new OrbitControls(camera, el);
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
    };

    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el });
    renderer.setSize(container?.clientHeight, container?.clientWidth);

    if (debugging) {
      debug_camera = new THREE.OrthographicCamera(
        -50,
        50,
        40,
        -20,
        -100000,
        1000000
      );
      debug_camera.position.set(0, 10, 20);
      debug_camera.lookAt(40000, 0, 0);
      debug_renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: debug_canvas,
      });
      debug_renderer.setSize(
        container?.clientHeight,
        container?.clientWidth / 2.0
      );

      // let debug_controls = new OrbitControls(debug_camera, debug_canvas);

      cameraHelper = new THREE.CameraHelper(camera);
      scene.add(cameraHelper);

      // scene.add(new THREE.GridHelper(1000000, 100));
    }
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
      return x / time_scale_factor + timeBegin;
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
            time2x(video.times[0].starting_time) +
              0.5 * duration * time_scale_factor,
            y_position,
            0
          );

          if (i < 10 && log_at_first) {
            console.log("   ");
            console.log("------");
            console.log(
              video.UAR,
              video[
                $platform_config_store[
                  "Title of column used for chronolocation"
                ]
              ]
            );
            console.log("time  begin: ", timeBegin);
            console.log("video begin: ", video.times[0].starting_time);
            console.log("video x:     ", time2x(video.times[0].starting_time));
            console.log(
              "video x w l: ",
              time2x(video.times[0].starting_time) +
                0.5 * duration * time_scale_factor
            );
          }

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
    log_at_first = false;
    renderer.render(scene, camera);

    if (debugging) {
      camera.updateMatrix();
      cameraHelper.update();
      debug_renderer.render(scene, debug_camera);
    }
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
    updateTimeMarker();
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
    camera.left -= horizontal_range * 0.1 * Math.sign(event.wheelDelta);
    camera.right += horizontal_range * 0.1 * Math.sign(event.wheelDelta);
    camera.updateProjectionMatrix();
    updateTimeMarker();
  };

  let updateTimeMarker = () => {
    console.log(" ");
    console.log("-----");
    console.log(" ");
    let time_begin = new Date(
      $platform_config_store["Timeline begin datetime"]
    );
    console.log(
      "timeBegin:",
      time_begin.getTime(),
      ">",
      time_begin.toISOString()
    );

    let time_end = new Date($platform_config_store["Timeline end datetime"]);
    console.log("timeEnd: ", time_end.getTime(), ">", time_end.toISOString());

    let mapped_time = Math.floor(x2time(camera.position.x));
    console.log("camera x :", camera.position.x);
    console.log(
      "x time: ",
      mapped_time,
      ">",
      new Date(mapped_time).toISOString()
    );
    console.log(
      "x - begin / begin: ",
      (mapped_time - time_begin.getTime()) / time_begin.getTime()
    );

    console.log("left", camera.left);
    let mapped_left = x2time(camera.left);
    console.log(
      "left time: ",
      mapped_left,
      ">",
      new Date(mapped_left).toISOString()
    );

    console.log("adjusted left:", camera.left - camera.position.x);
    let mapped_adj_left = x2time(camera.left - camera.position.x);
    console.log(
      "adj left time: ",
      mapped_adj_left,
      ">",
      new Date(mapped_adj_left).toISOString()
    );
  };
</script>

<div bind:this={container} id="timeline_container" on:mousewheel={handleScroll}>
  <canvas
    bind:this={el}
    on:mousemove={handleMouseMove_throttle}
    on:mousedown={handleMouseDown}
    on:mouseup={handleMouseUp}
    on:mouseleave={handleMouseLeave}
  />
  {#if debugging}
    <canvas
      id="debug_canvas"
      bind:this={debug_canvas}
      style="position: fixed;
      overflow: hidden;
      z-index: 2;
    opacity: 50%;
    pointer-events: none;"
    />
  {/if}
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

  #center_time_marker {
    position: relative;
    left: 50%;
  }
</style>
