<script>
    import { onMount } from "svelte";
    import { watchResize } from "svelte-watch-resize";
    import { validate_component } from "svelte/internal";

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
        items,
        container,
        main_timeline,
        timeBegin = 0,
        timeEnd;

    $: {
        videos = Object.values($media_store_filtered);
        videos_w_chrono = videos
            .filter((video) => video.start !== undefined)
            .sort(
                (a, b) => b.times[0].starting_time - a.times[0].starting_time
            );
        if (videos_w_chrono.length > 0)
            timeBegin = videos_w_chrono[0].times[0].starting_time;
    }
    let el;

    let camera, scene, renderer;
    let mesh;
    const amount = 50;
    const count = Math.pow(amount, 3);
    const dummy = new THREE.Object3D();

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

                dummy.position.set(
                    (video.times[0].starting_time +
                        0.5 * duration -
                        timeBegin) /
                        100000,
                    i,
                    0
                );

                dummy.scale.set(duration / 100000, 0.95, 1);

                dummy.updateMatrix();

                mesh.setMatrixAt(i++, dummy.matrix);
            });

            mesh.instanceMatrix.needsUpdate = true;
        }

        renderer.render(scene, camera);
    }

    let handleResize = () => {
        console.log(el);
    };
</script>

<canvas bind:this={el} use:watchResize={handleResize} />

<style>
    canvas {
        position: relative;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>
