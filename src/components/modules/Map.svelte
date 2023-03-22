<script>
  import { Map, Marker, controls } from "@beyonk/svelte-mapbox";
  import { throttle } from "underscore";
  import { watchResize } from "svelte-watch-resize";
  import {
    platform_config_store,
    media_store_filtered,
    ui_store,
  } from "../../stores/store";
  const { NavigationControl, ScaleControl } = controls;

  let zoom, mapComponent;

  let handleResize = throttle(() => {
    if (mapComponent) mapComponent.resize();
  }, 500);

  function onMarkerClick(event) {
    let UAR = event.target.dataset.uar; //automatically lowercased
    if ($ui_store.media_in_view.includes(UAR)) {
      $ui_store.media_in_view = $ui_store.media_in_view.filter(
        (exist_UAR) => exist_UAR !== UAR
      );
    } else {
      $ui_store.media_in_view = [...$ui_store.media_in_view, UAR];
    }
  }
  function onMarkerOver(event) {
    let UAR = event.target.dataset.uar; //automatically lowercased
    $ui_store.media_hovered = [...$ui_store.media_hovered, UAR];
  }
  function onMarkerOut(event) {
    let UAR = event.target.dataset.uar; //automatically lowercased
    $ui_store.media_hovered = $ui_store.media_hovered.filter(
      (exist_UAR) => exist_UAR !== UAR
    );
  }
</script>

<!-- svelte-ignore missing-declaration -->
<span class="map_container" use:watchResize={handleResize}>
  {#if $platform_config_store["Map start latitude"] !== undefined}
    <Map
      bind:this={mapComponent}
      accessToken={MAPBOX_ACCESS_TOKEN}
      options={{
        style: "mapbox://styles/situmapping/cl27sefh1000r15o2yvb5er0k",
        center: [
          parseFloat($platform_config_store["Map start longitude"]),
          parseFloat($platform_config_store["Map start latitude"]),
        ],
        doubleClickZoom: false,
      }}
      zoom={parseFloat($platform_config_store["Map start zoom"])}
    >
      <style>
        a.mapboxgl-ctrl-logo,
        #map
          > div.mapboxgl-control-container
          > div.mapboxgl-ctrl-bottom-right
          > div {
          visibility: hidden;
        }
      </style>
      <NavigationControl />
      <ScaleControl />
      <!-- {#each Object.values($media_store_filtered) as medium} -->
      {#each Object.values($media_store_filtered).filter((video) => !isNaN(video.lat) && !isNaN(video.long)) as medium}
        <span>
          <Marker lat={medium.lat} lng={medium.long} popup={false}>
            <div
              on:click={onMarkerClick}
              on:mouseover={onMarkerOver}
              on:mouseout={onMarkerOut}
              data-UAR={medium.UAR}
              style="
                              font-size:{$ui_store.media_hovered.includes(
                medium.UAR
              ) || $ui_store.media_in_view.includes(medium.UAR)
                ? '60px'
                : '30px'};
                              color:red"
            >
              {$ui_store.media_in_view.includes(medium.UAR) ? "•" : "◦"}
            </div>
          </Marker>
        </span>
      {/each}
    </Map>
  {/if}
</span>

<style>
  :global(.mapboxgl-marker) {
    cursor: pointer;
  }

  .map_container {
    height: 100%;
    width: 100%;
  }
</style>
