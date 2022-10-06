<script>
  import { missing_component } from "svelte/internal";
  import {
    media_store_filtered,
    ui_store,
    platform_config_store,
  } from "../stores/store";
  export let mouse_xy;
  let tooltip, hovered_UAR, hovered_media, hovered_corrected_time;

  $: {
    hovered_UAR = $ui_store.media_hovered[0];
    hovered_media = $media_store_filtered[hovered_UAR];
    if (hovered_media) {
      const dateOptions = {
        timeZone: "UTC",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      };
      const dateFormatter = new Intl.DateTimeFormat("en-UK", dateOptions);
      try {
        hovered_media.start_string_utc = dateFormatter.format(
          hovered_media.start
        );
      } catch {
        hovered_media.start_string_utc = "not available";
      }
    }
  }

  let overflow_compensate_class = "";
  $: {
    let tooltip_will_overflow_vertical =
      tooltip?.clientHeight + mouse_xy.y > document.body.clientHeight;
    let tooltip_will_overflow_horizontal =
      tooltip?.clientWidth + mouse_xy.x > document.body.clientWidth;
    let tooltip_will_overflow_both =
      tooltip_will_overflow_vertical && tooltip_will_overflow_horizontal;

    if (tooltip_will_overflow_both) {
      overflow_compensate_class = "translate_left_up";
    } else if (tooltip_will_overflow_horizontal) {
      overflow_compensate_class = "translate_left";
    } else if (tooltip_will_overflow_vertical) {
      overflow_compensate_class = "translate_up";
    } else {
      overflow_compensate_class = "";
    }
  }
</script>

{#if hovered_media}
  <table
    id="tooltip"
    style="top:{mouse_xy.y}px; left:{mouse_xy.x}px"
    bind:this={tooltip}
    class={"box text_level2 " + overflow_compensate_class}
  >
    <tr>
      <td>UAR</td>
      <td>{hovered_UAR}</td>
    </tr>
    <tr>
      <td>date</td>
      <td>{hovered_media["ChronoDateTime"].slice(0, 11)}</td>
    </tr>
    <tr>
      <td>time</td>
      <td>{hovered_media.start_string_utc}</td>
    </tr>
    <tr>
      <td>duration</td>
      <td
        >{hovered_media[
          $platform_config_store["Title of column used for duration"]
        ]}</td
      >
    </tr>
    {#if hovered_media.lat}
      <tr>
        <td>latitude</td>
        <td>{hovered_media.lat}</td>
      </tr>
    {/if}
    {#if hovered_media.long}
      <tr>
        <td>longitude</td>
        <td>{hovered_media.long}</td>
      </tr>
    {/if}
    {#if hovered_media["Misc Notes"]}
      <tr>
        <td>notes</td>
        <td>{hovered_media["Misc Notes"]}</td>
      </tr>
    {/if}
  </table>
{/if}

<style>
  #tooltip {
    z-index: 3;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    background: black;
    width: 250px;
    color: white;
  }

  tr > td:first-child {
    color: var(--grey2);
    text-transform: uppercase;
  }

  .translate_left {
    transform: translateX(-100%);
  }

  .translate_up {
    transform: translateY(-100%);
  }

  .translate_left_up {
    transform: translate(-100%, -100%);
  }
</style>
