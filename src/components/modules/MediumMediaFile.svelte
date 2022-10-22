<script lang="ts">
 import MediaForm from "./MediaForm.svelte";

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

<div class="medium" id={medium.id}>
  {#if src.includes("mp4") || src.includes("mov")}
    <video controls muted {src} type="video/mp4" />
  {:else if src.includes("png") || src.includes("jpeg") || src.includes("jpg")}
    <!-- svelte-ignore a11y-missing-attribute -->
    <img {src} />
  {/if}
  <MediaForm {medium}></MediaForm>
</div>

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

