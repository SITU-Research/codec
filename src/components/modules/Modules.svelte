<script>
  import Module from "./Module.svelte";
</script>

<div id="modules_container">
  <Module module={"media"} />
  <Module module={"timeline"} />
  <Module module={"map"} />
</div>

<style>
  #modules_container {
    height: calc(100vh - 6 * var(--grid-size));
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    justify-items: stretch;
  }
</style>
