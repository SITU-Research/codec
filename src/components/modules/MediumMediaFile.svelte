<script lang="ts">
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

  /* We check if we have some kind of photo or a video*/
  const isPhoto = src.match(/.jpg|.png|.jpeg/i) || false;
</script>

{#if src.includes("mp4") || src.includes("mov")}
  <div class="medium_video" id={medium.id}>
    <video controls muted {src} type="video/mp4" />
  </div>
{:else if src.includes("png") || src.includes("jpeg") || src.includes("jpg")}
  <div class="medium_image" id={medium.id}>
    <!-- svelte-ignore a11y-missing-attribute -->
    <img {src} />
  </div>
{/if}

<style>
  .medium  {
    display: flex;
    width: auto;
    height: 40vh;
    margin: 0 auto;
    overflow: hidden; /* Add this */
  }

 .medium > * {
   width: auto;
   height: 100%;
   object-fit: contain;
 }
</style>
