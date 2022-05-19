<script>
  import { ui_store } from "../stores/store";
  import { Grid, gridHelp } from "../svelte-grid";
  import Timeline from "./Timeline.svelte";
  import Map from "./Map.svelte";
  import Media from "./Media.svelte";

  let resized_wakies = 0;

  const id = () => "_" + Math.random().toString(36).substr(2, 9);
  let rowHeight = 30;
  let n_cols = 20;
  let cols = [[1, n_cols]];

  let h = document.body.clientHeight - 50;

  let items = [
    {
      [n_cols]: gridHelp.item({
        x: 0,
        y: 0,
        w: n_cols,
        h: Math.round(h / (2 * rowHeight)),
        customDragger: true,
      }),
      id: id(),
      type: "Media",
    },
    {
      [n_cols]: gridHelp.item({
        x: 0,
        y: Math.round(h / (2 * rowHeight)),
        w: n_cols / 2,
        h: Math.round(h / (2 * rowHeight)),
        customDragger: true,
      }),
      id: id(),
      type: "Timeline",
    },
    {
      [n_cols]: gridHelp.item({
        x: n_cols / 2,
        y: Math.round(h / (2 * rowHeight)),
        w: n_cols / 2,
        h: Math.round(h / (2 * rowHeight)),
        customDragger: true,
      }),
      id: id(),
      type: "Map",
    },
  ];

  $: {
    if ($ui_store.add_module_request) {
      add($ui_store.add_module_request);
      $ui_store.add_module_request = null;
    }
  }

  const remove = (item) => {
    items = items.filter((value) => value.id !== item.id);
    items = gridHelp.adjust(items, n_cols);
  };

  // INPUT: type of item to add - a module component name eg Timeline
  const add = (item_type) => {
    let newItem = {
      [n_cols]: gridHelp.item({
        x: 0,
        y: Math.round(h / (2 * rowHeight)),
        w: n_cols / 2,
        h: Math.round(h / (2 * rowHeight)),
        customDragger: true,
      }),
      id: id(),
      type: item_type,
    };

    let findOutPosition = gridHelp.findSpace(newItem, items, n_cols);

    newItem = {
      ...newItem,
      [n_cols]: {
        ...newItem[n_cols],
        ...findOutPosition,
      },
    };

    items = [...items, ...[newItem]];
  };
</script>

<div id="modules_container">
  <Grid
    fastStart={true}
    fillSpace={true}
    {cols}
    gap={[1, 1]}
    bind:items
    {rowHeight}
    let:item
    let:dataItem
    let:movePointerDown
    on:change={() => {
      resized_wakies += 1;
    }}
    on:addModule={(event) => console.log("add module event received!!")}
  >
    <div class="module">
      <div class="module_topbar">
        {#if item.customDragger}
          <div class="module_dragger" on:pointerdown={movePointerDown}>
            &#x2725;
          </div>
        {/if}
        <div class="module_title">{dataItem.type}</div>
        <div
          class="module_close"
          on:pointerdown={(e) => e.stopPropagation()}
          on:click={() => remove(dataItem)}
        >
          &#215;
        </div>
      </div>
      <div class="module_content">
        {#if dataItem.type == "Map"}
          <Map {resized_wakies} />
        {:else if dataItem.type == "Timeline"}
          <Timeline />
        {:else if dataItem.type == "Media"}
          <Media />
        {/if}
      </div>
    </div>
  </Grid>
</div>

<style>
  #modules_container {
    height: 96%;
    width: 100%;
  }

  .module {
    height: 100%;
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    background-color: rgb(31, 31, 31);
    outline: 1px solid white;
  }

  :global(.svlt-grid-resizer) {
    z-index: 2;
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

  .module_dragger {
    cursor: pointer;
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
