<script>
  import {
    media_store_filtered,
    events_store,
    ui_store,
    platform_config_store,
  } from "../stores/store";
  import { DataSet, DataView, Timeline, moment } from "vis-timeline/standalone";
  // import "vis-timeline/styles/vis-timeline-graph2d.css";

  import { onMount } from "svelte";

  let videos,
    items,
    container,
    main_timeline,
    mini_timeline,
    brush_default_object,
    timeBegin,
    timeEnd;

  $: {
    timeBegin = localtoUTCdatetimeobj(
      new Date($platform_config_store["Timeline begin datetime"])
    );
    timeEnd = localtoUTCdatetimeobj(
      new Date($platform_config_store["Timeline end datetime"])
    );
  }

  // update when media_store_filtered changes
  $: {
    videos = Object.values($media_store_filtered);
    let videos_w_chrono = videos.filter((video) => video.start !== undefined);
    items = new DataSet(videos_w_chrono);
    let view = new DataView(items);
    let viewed_items = view.get();
    main_timeline?.setItems(viewed_items);
  }

  // update when events_store changes
  $: {
    let copy_custom_times = main_timeline?.customTimes.slice(0);
    copy_custom_times?.forEach((custom_time) => {
      let id = custom_time.options.id;
      if (!id.includes("current_time_line")) main_timeline.removeCustomTime(id);
    });
    $events_store.forEach((el) => {
      main_timeline?.addCustomTime(el.start, el.id);
      main_timeline?.setCustomTimeTitle("", el.id);
      main_timeline?.customTimes[
        main_timeline?.customTimes.length - 1
      ].hammer.off("panstart panmove panend");
    });
  }

  // update when ui_store changes
  $: {
    // match timeline's clicked/unclicked items with ui_store
    // get list of html elements that are shown as clicked, get their UAR
    let clicked_timeline_els = [
      ...document.getElementsByClassName("clicked"),
    ].map((el) => el["vis-item"].id);
    // list of elements shown as clicked but no longer clicked according to ui_store
    let no_longer_clicked = clicked_timeline_els.filter(
      (x) => !$ui_store.media_in_view.includes(x)
    );
    // list of elements not shown as clicked but clicked according to ui_store
    let newly_clicked = $ui_store.media_in_view.filter(
      (x) => !clicked_timeline_els.includes(x)
    );

    no_longer_clicked.forEach((UAR) => {
      let item = main_timeline.itemSet.items[UAR];
      if (item !== undefined) {
        item.data.className = item.data.className.replaceAll(" clicked", "");
        main_timeline.itemSet.items[UAR].setData(item.data);
      }
    });

    newly_clicked.forEach((UAR) => {
      let item = main_timeline.itemSet.items[UAR];
      if (item !== undefined) {
        item.data.className += " clicked";
        main_timeline.itemSet.items[UAR].setData(item.data);
      }
    });

    // match timeline's hovered/unhovered items with ui_store
    // get list of html elements that are shown as hovered, get their UAR
    let hovered_timeline_els = [
      ...document.getElementsByClassName("hovered"),
    ].map((el) => el["vis-item"].id);
    // list of elements shown as hovered but no longer hovered according to ui_store
    let no_longer_hovered = hovered_timeline_els.filter(
      (x) => !$ui_store.media_in_view.includes(x)
    );
    // list of elements not shown as hovered but hovered according to ui_store
    let newly_hovered = $ui_store.media_in_view.filter(
      (x) => !hovered_timeline_els.includes(x)
    );

    no_longer_hovered.forEach((UAR) => {
      let item = main_timeline.itemSet.items[UAR];
      if (item !== undefined) {
        item.data.className = item.data.className.replaceAll(" hovered", "");
        main_timeline.itemSet.items[UAR].setData(item.data);
      }
    });

    newly_hovered.forEach((UAR) => {
      let item = main_timeline.itemSet.items[UAR];
      if (item !== undefined) {
        item.data.className += " hovered";
        main_timeline.itemSet.items[UAR].setData(item.data);
      }
    });
  }

  // do stuff at beginning
  onMount(() => {
    // creates main timeline vis timeline object
    // Configuration for the Timeline
    var options = {
      width: "100%",
      height: "100%",
      start: timeBegin, // set the timeline start time
      min: timeBegin, // set the timeline min time (i.e. can't scroll past)
      end: timeEnd, // set the timeline end time
      max: timeEnd, // set the timeline max time (i.e. can't scroll past)
      showMajorLabels: false,
      margin: {
        axis: 5, // space around the axis
        item: 4, // space around each item
      },
      orientation: {
        item: "top",
      },
      showCurrentTime: false, // don't show red bar showing current time
      order: (video_a, video_b) => {
        // determines how items will be stacked and ordered
        return video_a.start - video_b.start;
      },

      // display timeline dates with utc offset
      moment: function (date) {
        return moment(date).utcOffset(
          "+00:00", //$platform_config_store["Local GMT offset ([+-]HH:MM)"],
          false
        );
      },
    };

    // Create a Timeline
    main_timeline = new Timeline(container, items, options);

    // add event listener on click
    main_timeline.on("click", (properties) => {
      // properties.item is the Timeline id of the object
      // ie in this case defined to be the medium UAR
      let UAR = properties.item;
      if (UAR) {
        if ($ui_store.media_in_view.includes(UAR)) {
          $ui_store.media_in_view = $ui_store.media_in_view.filter(
            (exist_UAR) => exist_UAR !== UAR
          );
        } else {
          $ui_store.media_in_view = [...$ui_store.media_in_view, UAR];
        }
      }
    });

    // add event listener on click
    main_timeline.on("itemover", (properties) => {
      let UAR = properties.item;
      $ui_store.media_hovered = [...$ui_store.media_hovered, UAR];
    });

    // add event listener on click
    main_timeline.on("itemout", (properties) => {
      let UAR = properties.item;
      $ui_store.media_hovered = $ui_store.media_hovered.filter(
        (exist_UAR) => exist_UAR !== UAR
      );
    });

    // add event listener for when timeline is dragged or zoomed
    main_timeline.on("rangechange", function (properties) {
      updateBookendsToMatchTimeline(properties);
      updateCurrentTimeToMatchTimeline(properties);
    });

    // add current time line
    main_timeline.addCustomTime(
      timeBegin.getTime() / 2 + timeEnd.getTime() / 2,
      "current_time_line"
    );

    main_timeline.on("mouseOver", (properties) => {
      if (properties.customTime !== null) {
        //function tomake div visible with right content
        updateEventTooltip(properties);
      } else {
        document.getElementById("hover_box").style.display = "none";
        // optional custom time marker changes
        try {
          document.getElementsByClassName(
            "current_time_line"
          )[0].style.display = "block";
          document.getElementById("current_time_text").style.display = "block";
        } catch (error) {
          console.log(error);
        }
      }
    });
  });

  function updateBookendsToMatchTimeline(properties) {
    document.getElementById("main_start_bookend").textContent = date2month_day(
      properties.start
    );
    document.getElementById("main_end_bookend").textContent = date2month_day(
      properties.end
    );
  }

  function updateCurrentTimeToMatchTimeline(properties) {
    let current_time = new Date(
      (properties.start.getTime() + properties.end.getTime()) / 2
    );
    // make sure offset from utc is accounted for
    // current_time.setHours(
    //   current_time.getHours() -
    //     utcstring2int($platform_config_store["Local GMT offset ([+-]HH:MM)"])
    // );
    main_timeline.removeCustomTime("current_time_line");
    main_timeline.addCustomTime(current_time, "current_time_line");

    let current_time_line =
      main_timeline.customTimes[main_timeline.customTimes.length - 1];
    current_time_line.hammer.off("panstart panmove panend");

    let current_time_text_el = document.getElementById("current_time_text");
    let main_timeline_boundingrect = document
      .getElementById("main_timeline")
      .getBoundingClientRect();
    current_time_text_el.style.left =
      main_timeline_boundingrect.left + main_timeline_boundingrect.width / 2;

    current_time_text_el.children[1].textContent = date2time(current_time);
    current_time_text_el.children[2].textContent = date2month_day(current_time);
  }

  function date2month_day(date) {
    const dateOptions = {
      timeZone: "UTC",
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    const dateFormatter = new Intl.DateTimeFormat("en-US", dateOptions);
    const dateAsFormattedString = dateFormatter.format(date);
    return dateAsFormattedString;
  }
  function date2time(date) {
    const dateOptions = {
      timeZone: "UTC",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    const dateFormatter = new Intl.DateTimeFormat("en-UK", dateOptions);
    const dateAsFormattedString = dateFormatter.format(date);
    return dateAsFormattedString;
  }

  function updateEventTooltip(properties) {
    let element = document.getElementById("hover_box");
    let id = properties.customTime.split(" ")[0];
    let text = document.getElementById("eventDescription");
    if (properties.customTime !== "current_time_line") {
      element.style.display = "block";
      text.innerHTML = $events_store[id].description;
      // optional removal of custom time marker
      document.getElementsByClassName("current_time_line")[0].style.display =
        "none";
      document.getElementById("current_time_text").style.display = "none";
    }
  }

  // Takes datetime object created on local machine with time offset
  // returns datetime object in UTC time when read by same local machine
  function localtoUTCdatetimeobj(datetimeobj) {
    let userTimezoneOffset = datetimeobj.getTimezoneOffset() * 60000;
    return new Date(datetimeobj.getTime() - userTimezoneOffset);
  }
</script>

<div id="timeline_container">
  <style>
    .vis-panel.vis-bottom,
    .vis-panel.vis-center,
    .vis-panel.vis-top {
      border: none;
    }
  </style>
  <div id="timeline_top">
    <div id="main_start_bookend_container">
      <div id="main_start_bookend" />
    </div>
    <div
      bind:this={container}
      id="main_timeline"
      on:mouseout={() => {
        document.getElementById("hover_box").style.display = "none";
      }}
    >
      <style>
        #main_timeline .vis-timeline {
          border-top: none !important;
          border-bottom: none !important;
        }

        .vis-time-axis .vis-grid.vis-minor,
        .vis-time-axis .vis-grid.vis-major {
          border-color: rgb(39, 39, 39);
        }

        .vis-item {
          border-color: rgb(39, 39, 39);
          background-color: white;
          border-radius: 10px;
          z-index: 1;
        }

        #main_timeline .vis-item {
          height: 15px;
        }

        .vis-item.vis-selected {
          border-color: white;
          fill: white;
          background-color: white;
        }

        #main_timeline .vis-item.vis-range {
          border-style: solid;
          border-radius: 10px;
          box-sizing: border-box;
          border-color: white;
          border-width: 3px;
        }

        .vis-item.clicked {
          background-color: #d90c1e;
        }

        .vis-item.hovered {
          border-color: #d90c1e !important;

          fill: none;
        }

        .vis-custom-time {
          background-color: white;
          width: 3px;
          cursor: default;
          opacity: 0.2;
        }

        .vis-custom-time.current_time_line {
          background-color: #d90c1e;
          width: 5px;
          opacity: 0.5;
        }

        #current_time_text {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
        }

        .triangle-up {
          width: 0;
          height: 0;
          border-left: 25px solid transparent;
          border-right: 25px solid transparent;
          border-bottom: 50px solid #555;
        }

        #main_start_bookend_container,
        #main_end_bookend_container {
          height: 100%;
          width: 1.4em;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border: 1px solid white;
          overflow: visible;
          position: relative;
        }

        #main_start_bookend_container {
          border-top-left-radius: 20px;
          border-bottom-left-radius: 20px;
          margin-left: 1%;
        }

        #main_end_bookend_container {
          border-top-right-radius: 20px;
          border-bottom-right-radius: 20px;
          margin-right: 1%;
        }

        #main_start_bookend,
        #main_end_bookend {
          position: absolute;
          bottom: 0;
          left: 0px;
          width: 100px;
          transform: rotate(-90deg);
          transform-origin: top left;
          text-align: left;
        }
      </style>
      <div id="hover_box">
        <p id="eventDescription" />
      </div>
    </div>
    <div id="main_end_bookend_container">
      <div id="main_end_bookend" />
    </div>
  </div>
  <div id="timeline_middle">
    <div id="current_time_text">
      <div class="triangle_up" />
      <div id="line1" />
      <div id="line2" />
    </div>
  </div>
</div>

<style>
  #timeline_container {
    width: 100%;
    height: 100%;
    /* height: 100%; */
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  #timeline_top {
    width: 100%;
    height: 80%;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: center;
  }

  #main_timeline {
    width: 95%;
    height: 100%;
    border-top: 1px solid white;
    border-bottom: 1px solid white;
  }

  #timeline_middle {
    height: 40px;
    display: flex;
    flex-direction: column;
  }

  #hover_box {
    width: 100%;
    height: 100%;
    top: 40%;
    margin-top: -40px;
    display: none;
    position: absolute;
    pointer-events: none; /* box is too large, so w/o this can't unhover away from event item*/
    z-index: 2;
  }

  #eventDescription {
    text-align: center;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 3%;
  }

  #timeline_bottom {
    width: 100%;
    height: 20%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    align-content: center;
  }

  #mini_timeline {
    height: 90%;
    flex-grow: 200;
    overflow: visible !important;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  #mini_start_bookend,
  #mini_end_bookend {
    /* width: 5%; */
    flex-grow: 1;
    margin: 1%;
    text-anchor: middle;
    font-size: 0.9em;
  }
</style>
