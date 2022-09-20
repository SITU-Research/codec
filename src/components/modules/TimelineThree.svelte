<script>
  import { onMount } from "svelte";
  import { watchResize } from "svelte-watch-resize";
  import { validate_component } from "svelte/internal";
  import { throttle } from "underscore";

  import * as THREE from "three";
  import { OrbitControls } from "../../../node_modules/three/examples/jsm/controls/OrbitControls.js";

  import {
    media_store_filtered,
    events_store,
    ui_store,
    platform_config_store,
  } from "../../stores/store";
  import Timeline from "./Timeline.svelte";

  let videos,
    videos_w_chrono,
    timeBegin = 0,
    timeEnd,
    orderedTime = true,
    orderedOtherIndex = {};

  $: {
    videos = Object.values($media_store_filtered);
    videos_w_chrono = videos
      .filter((video) => video.start !== undefined)
      .sort((a, b) => b.times[0].starting_time - a.times[0].starting_time);
    if (videos_w_chrono.length > 0)
      timeBegin = videos_w_chrono[0].times[0].starting_time;

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
  }
  let el;

  let camera, scene, renderer, canvasWidth, canvasHeight;
  let mesh;
  const amount = 50;
  const count = Math.pow(amount, 3);
  const dummy = new THREE.Object3D();
  let mousePos = new THREE.Vector3();
  let mouse = new THREE.Vector2(1, 1);
  const raycaster = new THREE.Raycaster();

  onMount(() => {
    init(el);
    animate();
  });

  function init(el) {
    // camera = new THREE.PerspectiveCamera(60, 0.5, 0.1, 100);
    camera = new THREE.OrthographicCamera(-100, 100, 100, -100, 1, 5);
    camera.position.set(0, 0, 2);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    let geometry = new THREE.BoxBufferGeometry();
    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial();
    // check overdraw
    // let material = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.1, transparent: true } );

    mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
    scene.add(mesh);
    const controls = new OrbitControls(camera, el);
    controls.enableRotate = false;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
    };

    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el });
    renderer.setSize(600, 800);
  }

  const animate = () => {
    requestAnimationFrame(animate);
    render();
  };

  function render() {
    if (mesh) {
      let i = 0;

      videos_w_chrono.forEach((video) => {
        // example starting time 1646352000000
        let duration =
          video.times[0].ending_time - video.times[0].starting_time;

        let y_position;
        if (orderedTime) {
          y_position = i * 0.2;
        } else {
          y_position =
            orderedOtherIndex[video[$platform_config_store["Assets ordering"]]];
        }

        dummy.position.set(
          (video.times[0].starting_time + 0.5 * duration - timeBegin) / 100000,
          y_position,
          0
        );

        dummy.scale.set(duration / 100000, 0.199, 1);

        dummy.updateMatrix();

        mesh.setMatrixAt(i++, dummy.matrix);
      });

      mesh.instanceMatrix.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  function handleResize(node) {
    canvasWidth = node.clientWidth;
    canvasHeight = node.clientHeight - 10;

    renderer.setSize(canvasWidth, canvasHeight);
    camera.aspect = canvasWidth / canvasHeight;
    camera.updateProjectionMatrix();
  }

  function handleMouseMove(event) {
    // mousePos.set(
    //   (event.clientX / canvasWidth) * 2 - 1,
    //   -(event.clientY / canvasHeight) * 2 + 1,
    //   0
    // );
    // mousePos.unproject(camera);
    // console.log(mousePos);
    mouse.x = (event.offsetX / canvasWidth) * 2 - 1;
    mouse.y = -(event.offsetY / canvasHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersection = raycaster.intersectObject(mesh);

    if (intersection.length > 0) {
      const instanceId = intersection[0].instanceId;
      console.log(videos_w_chrono[instanceId]);
      $ui_store.media_hovered = [videos_w_chrono[instanceId].UAR];
    } else {
      $ui_store.media_hovered = [];
    }
  }

  let handleMouseMove_throttle = throttle(handleMouseMove, 200);

  let handleMouseClick = (event) => {
    mouse.x = (event.offsetX / canvasWidth) * 2 - 1;
    mouse.y = -(event.offsetY / canvasHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersection = raycaster.intersectObject(mesh);

    if (intersection.length > 0) {
      const instanceId = intersection[0].instanceId;
      let UAR = videos_w_chrono[instanceId].UAR;

      if ($ui_store.media_in_view.includes(UAR)) {
        $ui_store.media_in_view = $ui_store.media_in_view.filter(
          (exist_UAR) => exist_UAR !== UAR
        );
      } else {
        $ui_store.media_in_view = [...$ui_store.media_in_view, UAR];
      }
    }
  };
</script>

<div use:watchResize={handleResize}>
  <canvas
    bind:this={el}
    on:mousemove={handleMouseMove_throttle}
    on:click={handleMouseClick}
  />
</div>

<style>
  div {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  canvas {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
