<script>
  import { local_file_store, platform_config_store } from "../../stores/store";
  import {
    sync_time,
    sync_paused,
    sync_time_origin_UAR,
  } from "../../stores/sync_time_store";
  export let medium;

  let src;
  let used_filepath;
  let video_time = 0;
  let paused = true;
  if ($platform_config_store["Source of media files"].includes("local")) {
    try {
      used_filepath = $local_file_store[medium.UAR].name;
      src = URL.createObjectURL($local_file_store[medium.UAR]);
    } catch {
      src = null;
    }
  } else {
    used_filepath =
      medium[$platform_config_store["Title of column used for url"]];
    src = used_filepath;
  }

  let handleOnVideoPlay = () => {
    let new_time = new Date(
      medium.start.getTime() + Math.floor(video_time * 1000)
    );
    $sync_time = new_time;
    $sync_paused = paused;
    $sync_time_origin_UAR = medium.UAR;
  };

  $: {
    if (
      $sync_time.getTime() > medium.start.getTime() &&
      $sync_time.getTime() < medium.end.getTime() &&
      $sync_time_origin_UAR !== medium.UAR
    ) {
      console.log(medium.UAR);
      console.log($sync_time_origin_UAR, $sync_time);
      video_time = ($sync_time.getTime() - medium.start.getTime()) / 1000;
      paused = $sync_paused;
    }
  }
</script>

{#if src !== null}
  {#if used_filepath.toLowerCase().includes("mp4") || used_filepath
      .toLowerCase()
      .includes("mov") || used_filepath.toLowerCase().includes("webm")}
    <div class="medium_video" id={medium.id}>
      <video
        controls
        muted
        {src}
        type="video/mp4"
        bind:currentTime={video_time}
        bind:paused
        on:play={handleOnVideoPlay}
        on:pause={handleOnVideoPlay}
        on:seeked={handleOnVideoPlay}
      />
    </div>
  {:else if used_filepath.includes("png") || used_filepath.includes("jpeg") || used_filepath.includes("jpg") || used_filepath.includes("webp")}
    <div class="medium_image" id={medium.id}>
      <!-- svelte-ignore a11y-missing-attribute -->
      <img {src} />
    </div>
  {/if}
{/if}

<style>
  .medium_video {
    width: 100%;
    height: 40vh;
    margin: 0 auto;
    overflow: hidden; /* Add this */
  }

  .medium_image {
    height: 40vh;
    display: flex;
    flex-flow: column;
    flex-direction: row;
    justify-content: center;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>
