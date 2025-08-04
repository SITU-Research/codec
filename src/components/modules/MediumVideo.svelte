<script>
  import { local_file_store, platform_config_store } from "../../stores/store";
  export let medium;

  let src;
  let used_filepath;
  // export let video_start, video_end, progress;
  export let videos = {};

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

  //  Action<HTMLVideoElement>
  const video_action = (node, uar) => { 
    console.log("hi! :D");
    let index = -1;
    let intervalId = -1;

    // $effect(() => {
    //     // index = 
    //     videos[medium.UAR] = [node.video_start, node.duration, node.currentTime];
    //     // node.currentTime / node.duration

    //     intervalId = setInterval(() => {
    //       videos[uar][2] = node.currentTime;
    //     }, 100);
    // });

    // $return(() => {
    //   if (intervalId != -1)
    //     clearInterval(intervalId);
    // });
  };

</script>

{#if src !== null}
  {#if used_filepath.toLowerCase().includes("mp4") || used_filepath
      .toLowerCase()
      .includes("mov") || used_filepath
      .toLowerCase()
      .includes("webm") || used_filepath.toLowerCase().includes("m4v")}
    <div class="medium_video" id={medium.id}>
      <video controls muted {src} type="video/mp4" use:video_action />
      <!-- {document.getElementById(medium.id).video.} -->
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
