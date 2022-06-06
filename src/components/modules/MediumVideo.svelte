<script>
  import { local_file_store, platform_config_store } from "../../stores/store";
  export let medium;

  let src;
  if ($platform_config_store["Source of media files"].includes("local")) {
    try {
      src = URL.createObjectURL($local_file_store[medium.UAR]);
    } catch {
      src = null;
    }
  } else {
    src = medium[$platform_config_store["Title of column used for url"]];
  }
</script>

<div class="medium_video" id={medium.id}>
  <video controls muted {src} type="video/mp4" />
</div>

<style>
  .medium_video {
    width: 100%;
    height: 40vh;
    margin: 0 auto;
    overflow: hidden; /* Add this */
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>
