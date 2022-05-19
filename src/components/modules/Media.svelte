<script>
  import MediumVideo from "./MediumVideo.svelte";
  import { ui_store, media_store } from "../../stores/store";
</script>

<div class="media">
  {#each $ui_store.media_in_view as UAR}
    <MediumVideo medium={$media_store[UAR]} />
  {/each}
</div>

<style>
  .media {
    height: 100%;
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    align-items: stretch;
    align-content: stretch;
    overflow-y: hidden;
  }
</style>
