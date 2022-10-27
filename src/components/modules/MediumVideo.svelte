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
</script>

{#if src !== null}
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
