<script>
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

  let videos,
    videos_w_chrono,
    timeBegin = 0,
    timeEnd,
    time2x,
    x2time,
    orderedTime = true,
    orderedOtherIndex = {};

  let time_scale_factor = 0.00001;

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
  let mesh_notinview, white_material;
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

    white_material = new THREE.MeshBasicMaterial({ color: "white" });
    mesh_notinview = new THREE.InstancedMesh(geometry, white_material, count);
    mesh_notinview.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
    let color = new THREE.Color();
    new Array(count).fill(0).forEach((c, i) => {
      mesh_notinview.setColorAt(i, color.set(0xffffff));
    });

    scene.add(mesh_notinview);

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

    videos = Object.values($media_store_filtered);
    videos_w_chrono = videos
      .filter((video) => video.start !== undefined)
      .sort((a, b) => b.times[0].starting_time - a.times[0].starting_time);

    orderedTime =
      $platform_config_store["Title of column used for chronolocation"] ==
      $platform_config_store["Assets ordering"];
    if (!orderedTime) {
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

    if (camera && !initial_setup_done) {
      camera.left = time2x(timeBegin);
      camera.right = time2x(timeEnd);

      if (!orderedTime) {
        camera.top = Math.max(...Object.values(orderedOtherIndex)) + 1;
        camera.bottom = Math.min(...Object.values(orderedOtherIndex)) - 1;
      }
      camera.updateProjectionMatrix();
    }

    if (videos.length > 0) initial_setup_done = true;
  }

  const animate = () => {
    requestAnimationFrame(animate);
    render();
  };

  function render() {
    if (mesh_notinview) {
      let i = 0;

      new Array(count).fill(0).forEach((c, i) => {
        if (i < videos_w_chrono.length) {
          let video = videos_w_chrono[i];
          let duration =
            video.times[0].ending_time - video.times[0].starting_time;

          let y_position;
          if (orderedTime) {
            y_position = i * 0.2;
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
            mesh_notinview.setColorAt(i, new THREE.Color(0xff0000));
          } else {
            mesh_notinview.setColorAt(i, new THREE.Color(0xffffff));
          }
          mesh_notinview.setMatrixAt(i, dummy.matrix);
          i += 1;
        } else {
          dummy.scale.set(0, 0, 0);
          mesh_notinview.setMatrixAt(i, dummy.matrix);
        }
      });

      mesh_notinview.instanceMatrix.needsUpdate = true;
      mesh_notinview.instanceColor.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  function handleMouseMove(event) {
    mouse.x = (event.offsetX / canvasWidth) * 2 - 1;
    mouse.y = -(event.offsetY / canvasHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersection = raycaster.intersectObject(mesh_notinview);

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
      console.log(UAR);
      if (UAR) toggle_in_view(UAR);
    }
    mouse_dragged = false;
  };

  let identify_video = (event) => {
    mouse.x = (event.offsetX / canvasWidth) * 2 - 1;
    mouse.y = -(event.offsetY / canvasHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    let intersection = raycaster.intersectObject(mesh_notinview);
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
    // console.log("---- handle scroll -----");

    let mouse_vector = new THREE.Vector3();
    mouse_vector.set(
      (event.offsetX / canvasWidth) * 2 - 1,
      -(event.offsetY / canvasHeight) * 2 + 1,
      0
    );
    mouse_vector.unproject(camera);

    // console.log("camera.left", camera.left);
    // console.log("mouse_vector.x", mouse_vector.x);
    // console.log("camera.right", camera.right);

    let d_l = mouse_vector.x - camera.left;
    let d_r = camera.right - mouse_vector.x;
    let d_ratio = d_l / d_r;
    // console.log("d_l", d_l);
    // console.log("d_r", d_r);
    // console.log("d_ratio", d_ratio);

    camera.left +=
      (mouse_vector.x - camera.left) * 0.05 * Math.sign(event.wheelDelta);

    let d_l_new = mouse_vector.x - camera.left;
    let d_r_new = d_l_new / d_ratio;
    camera.right = mouse_vector.x + d_r_new;

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
