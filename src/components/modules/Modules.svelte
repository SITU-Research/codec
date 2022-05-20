<script>
  import { ui_store } from "../../stores/store";
  import Timeline from "./Timeline.svelte";
  import Map from "./Map.svelte";
  import Media from "./Media.svelte";

  let resized_wakies = 0;

  let modules_options = {
    media: Media,
    map: Map,
    timeline: Timeline,
  };
</script>

<div id="modules_container">
  {#each $ui_store.modules_in_view as module}
    <div class="box module">
      <div class="module_topbar">
        <div class="module_title text_level1">{module}</div>
        <div
          class="module_close"
          on:pointerdown={(e) => e.stopPropagation()}
          on:click={() => console.log("remove item")}
        >
          &#215;
        </div>
      </div>
      <div class="module_content">
        <svelte:component this={modules_options[module]} />
      </div>
    </div>
  {/each}
</div>

<style>
  #modules_container {
    height: calc(100vh - 6 * var(--grid-size));
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    justify-items: stretch;
  }

  .module {
    display: flex;
    flex-flow: column nowrap;
    flex-grow: 1;
    margin-bottom: var(--grid-size);
  }

  .module:not(:first-child) {
    margin-left: var(--grid-size);
  }

  .module_topbar {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    justify-items: stretch;
    align-items: center;
  }

  .module_topbar > * {
    line-height: 30px;
    width: 30px;
    height: 30px;
  }

  .module_title {
    flex-grow: 2;
  }

  .module_close {
    cursor: pointer;
  }

  .module_content {
    flex-grow: 2;
    min-width: 0;
    min-height: 0;
  }
</style>
