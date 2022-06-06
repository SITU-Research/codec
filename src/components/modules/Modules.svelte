<script>
  import Module from "./Module.svelte";
  import Media from "./Media.svelte";
  import { ui_store } from "../../stores/store";
</script>

<div id="modules_container">
  <Media
    style="display:{$ui_store.modules_in_view.includes('media')
      ? 'flex'
      : 'none'}"
  />
  <div id="nonmedia_container">
    <Module module={"timeline"} />
    <Module module={"map"} />
  </div>
</div>

<style>
  #modules_container {
    height: calc(100vh - 6 * var(--grid-size));
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-items: stretch;
  }

  #nonmedia_container {
    flex: 1 1 50%;
    display: flex;
    flex-flow: row nowrap;
    justify-items: stretch;
  }
</style>
