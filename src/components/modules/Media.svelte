<script lang="ts">
 import { ui_store, media_store } from "../../stores/store";
 import Module from "./Module.svelte";
</script>

<div class="media">
  <!-- add (UAR) means it's a keyed each block, svelte tracks better -->
  {#each $ui_store.media_in_view as UAR (UAR)}
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
