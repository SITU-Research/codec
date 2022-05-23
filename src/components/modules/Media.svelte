<script>
  import { ui_store, media_store } from "../../stores/store";
  import Module from "./Module.svelte";
</script>

<div class="media">
  {#each $ui_store.media_in_view as UAR}
    <Module module={"media"} medium={$media_store[UAR]} />
  {/each}
</div>

<style>
  .media {
    display: flex;
    flex-flow: row nowrap;
    align-items: stretch;
    align-content: stretch;
    overflow-y: hidden;
  }
</style>
