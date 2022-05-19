<script>
  import {
    ui_store,
    local_file_store,
    platform_config_store,
  } from "../../stores/store";
  export let medium;

  function OnExitClick() {
    $ui_store.media_in_view = $ui_store.media_in_view.filter(
      (exist_UAR) => exist_UAR !== medium.UAR
    );
  }

  let src;
  if ($platform_config_store["Source of media files"].includes("local")) {
    try {
      src = URL.createObjectURL($local_file_store[medium.UAR]);
    } catch {
      src = null;
    }
  } else {
    src = medium.url;
  }
</script>

<div
  class={$ui_store.media_hovered.includes(medium.UAR)
    ? "medium_video medium_hovered"
    : "medium_video"}
  id={medium.id}
>
  <div class="video_top">
    <div class="video_top_title">{medium.UAR}</div>
    <div class="video_top_button" on:click={OnExitClick}>&#215;</div>
  </div>
  <video controls muted {src} type="video/mp4" />
</div>

<style>
  .medium_video {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border: 1px solid gray;
    border-radius: 5px;
    background: black;
    margin: 2px;
    flex-grow: 1;
    outline: none;
    outline-offset: -3px;
  }

  .medium_hovered {
    outline: 3px solid white;
  }

  .video_top {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-bottom: 1px solid gray;
    height: 1.5em;
  }

  .video_top_button {
    border-left: 1px solid gray;
    cursor: pointer;
  }

  .video_top_title,
  .video_top_button {
    padding: 0 5px 0 5px;
  }

  video {
    margin: 5px;
    min-width: 0;
    min-height: 0;
    max-width: 100%;
    max-height: 100%;
    border: none;
    flex-grow: 10;
  }
</style>
