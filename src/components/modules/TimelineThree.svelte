<script lang="ts">
  import { onDestroy, onMount } from "svelte";
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
  const one_second_in_ms = 1000;
  const fifteen_seconds_in_ms = 1000 * 15;
  const one_minute_in_ms = one_second_in_ms * 60;
  const fifteen_minutes_in_ms = one_minute_in_ms * 15;
  const one_hour_in_ms = one_minute_in_ms * 60;
  const six_hours_in_ms = one_hour_in_ms * 6;
  const one_day_in_ms = one_hour_in_ms * 24;
  const one_week_in_ms = one_day_in_ms * 7;
  const temporal_steps = [
    one_week_in_ms,
    one_day_in_ms,
    six_hours_in_ms,
    one_hour_in_ms,
    fifteen_minutes_in_ms,
    one_minute_in_ms,
    fifteen_seconds_in_ms,
    one_second_in_ms,
  ];

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

  let el, container, time_markers_text_el;
  let current_time_text;
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

  let camera,
    scene,
    renderer,
    controls,
    canvasWidth,
    canvasHeight,
    periodic_time_markers,
    line_material;
  let mesh, white_material;
  const amount = 50;
  const count = Math.pow(amount, 3);
  const dummy = new THREE.Object3D();
  let mouse = new THREE.Vector2(1, 1);
  const raycaster = new THREE.Raycaster();

  // debugging variables
  let debugging = false;
  let debug_canvas, debug_camera, debug_renderer, cameraHelper;

  onMount(() => {
    initial_setup_done = false;
    init(el, container);
    animate();
    ro.observe(container);
  });

  const cleanMaterial = (material) => {
    material.dispose();
    // dispose textures
    for (const key of Object.keys(material)) {
      const value = material[key];
      if (value && typeof value === "object" && "minFilter" in value) {
        value.dispose();
      }
    }
  };

  onDestroy(() => {
    renderer.dispose();

    scene.traverse((object) => {
      if (!object.isMesh) return;

      object.geometry.dispose();

      if (object.material.isMaterial) {
        cleanMaterial(object.material);
      } else {
        // an array of materials
        for (const material of object.material) cleanMaterial(material);
      }
    });
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
    controls = new OrbitControls(camera, el);
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
    };

    // add time markers
    const center_line_material = new THREE.LineBasicMaterial({
      color: 0xff0000,
    });
    const points = [
      new THREE.Vector3(0, 10000, 0),
      new THREE.Vector3(0, -10000, 0),
    ];
    const line_geometry = new THREE.BufferGeometry().setFromPoints(points);
    const center_time_marker = new THREE.Line(
      line_geometry,
      center_line_material
    );
    center_time_marker.position.z = -1.5;
    camera.add(center_time_marker);
    scene.add(camera);
    periodic_time_markers = new THREE.Group();
    line_material = new THREE.LineBasicMaterial({ color: 0x41484e });

    scene.add(periodic_time_markers);

    // add renderer
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
      let left, right, top, bottom;

      left = time2x(timeBegin);
      right = time2x(timeEnd);

      camera.position.x = left / 2 + right / 2;
      camera.right = (right - left) / 2;
      camera.left = -camera.right;
      if (!orderedByTime) {
        top = Math.max(...Object.values(orderedOtherIndex)) + 1;
        bottom = Math.min(...Object.values(orderedOtherIndex)) - 1;
      } else {
        top = free_time_at_row.length - 0.5;
        bottom = -0.5;
      }
      camera.position.y = top / 2 + bottom / 2;
      camera.top = (top - bottom) / 2;
      camera.bottom = -camera.top;
      camera.updateProjectionMatrix();
      controls.target = new THREE.Vector3(
        camera.position.x,
        camera.position.y,
        camera.position.z - 5
      );
      controls.update();
      updateTimeMarkers();
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

    periodic_time_markers.children.forEach((marker) => {
      const marker_pos = new THREE.Vector3(marker.position.x, 0, 0);
      marker_pos.project(camera);
      const x = (marker_pos.x * 0.5 + 0.5) * container?.clientWidth;
      marker.userData.textEl.style.left = `${x}px`;
    });

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
    updateTimeMarkers();
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
    updateTimeMarkers();
  };

  let updateTimeMarkers = () => {
    let mapped_time = Math.floor(x2time(camera.position.x));
    current_time_text = new Date(mapped_time).toUTCString().slice();
    current_time_text = current_time_text.slice(
      0,
      current_time_text.length - 4
    );
    update_periodic_time_markers();
  };

  let update_periodic_time_markers = () => {
    let mapped_left = x2time(camera.position.x + camera.left);
    let mapped_buffered_left = x2time(camera.position.x + 4 * camera.left);
    let mapped_right = x2time(camera.position.x + camera.right);
    let mapped_buffered_right = x2time(camera.position.x + 4 * camera.right);

    let temporal_range = mapped_right - mapped_left;
    let creation_time = mapped_buffered_left;

    // percentage of a temporal step (e.g. day) that temporal range needs
    // to be greater than, before that temporal step is drawn
    // ie how many lines visible at higher temporal step before
    // we switch to the lower temporal step (ie grid)
    const range2step_threshold = 2;
    // delete all marker lines
    for (var i = periodic_time_markers.children.length - 1; i >= 0; i--) {
      let time_marker = periodic_time_markers.children[i];
      time_marker.userData.textEl.remove();
      periodic_time_markers.remove(time_marker);
    }

    // some() stops computing when at least one element returns true
    temporal_steps.some((step, i) => {
      if (temporal_range > range2step_threshold * step) {
        create_array_time_marker_line(
          creation_time,
          mapped_buffered_right,
          step
        );
        return true;
      } else {
        return false;
      }
    });
  };

  const create_array_time_marker_line = (
    creation_time,
    mapped_buffered_right,
    temporal_step
  ) => {
    creation_time = creation_time - (creation_time % temporal_step);
    while (creation_time < mapped_buffered_right) {
      create_time_marker_line(creation_time, temporal_step);
      creation_time += temporal_step;
    }
  };

  const create_time_marker_line = (time, temporal_step) => {
    const points = [
      new THREE.Vector3(0, 10000, 0),
      new THREE.Vector3(0, -10000, 0),
    ];
    const line_geometry = new THREE.BufferGeometry().setFromPoints(points);
    const time_marker_line = new THREE.Line(line_geometry, line_material);
    time_marker_line.position.x = time2x(time);
    time_marker_line.userData.time_text = new Date(time).toISOString();
    periodic_time_markers.add(time_marker_line);

    const elem = document.createElement("div");
    switch (temporal_step) {
      case one_week_in_ms:
      case one_day_in_ms:
        elem.textContent = new Date(time).toISOString().slice(5, 10);
        break;
      case six_hours_in_ms:
      case one_hour_in_ms:
        elem.textContent = new Date(time).toISOString().slice(11, 16);
        break;
      case fifteen_minutes_in_ms:
      case one_minute_in_ms:
        elem.textContent = new Date(time).toISOString().slice(13, 16);
        break;
      case fifteen_seconds_in_ms:
      case one_second_in_ms:
        elem.textContent = new Date(time).toISOString().slice(16, 19);
        break;
      default:
        elem.textContent = new Date(time).toISOString();
    }
    elem.style.position = "absolute";
    elem.classList.toggle("text_level1");
    time_markers_text_el.appendChild(elem);
    time_marker_line.userData.textEl = elem;
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
  <div bind:this={time_markers_text_el} id="time_markers_text" />
  <div id="current_time_text" class="text_level1">{current_time_text}</div>
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

  #current_time_text {
    position: relative;
    z-index: 2;
    left: calc(50% + 5px);
    background-color: black;
    width: fit-content;
  }

  #time_markers_text {
    position: relative;
  }
</style>
