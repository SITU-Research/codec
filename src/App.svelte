<script>
  import { onMount } from "svelte";
  import { throttle } from "underscore";
  import LocalMediaInput from "./components/LocalMediaInput.svelte";
  import Topbar from "./components/Topbar.svelte";
  import Tooltip from "./components/Tooltip.svelte";
  import Modules from "./components/Modules.svelte";
  import {
    media_store,
    events_store,
    filter_toggles,
    platform_config_store,
  } from "./stores/store";

  let mouse_xy = { x: 0, y: 0 };
  let handleMouseMove = throttle((event) => {
    mouse_xy.x = event.clientX;
    mouse_xy.y = event.clientY;
  }, 5);

  onMount(() => {
    let fetch_interval = setInterval(fetch_google_sheet_data, 10000);
    return () => {
      clearInterval(fetch_interval);
    };
  });

  function fetch_google_sheet_data() {
    return fetch(
      `/.netlify/functions/googlesheets?sheet=platformconfig&offset=1`
    )
      .then((rows_string) => rows_string.json())
      .then((platform_config) => {
        $platform_config_store = platform_config;
        fetch(
          `/.netlify/functions/googlesheets?sheet=` +
            platform_config["Title of tab with media assets"] +
            `&offset=` +
            platform_config["Rank of assets row with column names"]
        )
          .then((rows_string) => rows_string.json())
          .then((media) => {
            process_video_sheet_response(media);
          });

        fetch(
          `/.netlify/functions/googlesheets?sheet=` +
            platform_config["Title of tab with events"] +
            `&offset=` +
            platform_config["Rank of events row with column names"]
        )
          .then((rows_string) => rows_string.json())
          .then((events) => {
            process_event_sheet_response(events);
          });
      });
  }

  function process_event_sheet_response(rows) {
    // first row of table is column names
    let column_names = rows[0].map((col_name) => col_name.toLowerCase());

    // create array to feed data as being processed
    let events = [];

    // for every row (skipping the first row of column names)
    rows.slice(1).forEach((row, i) => {
      // create a video object
      let event = {};
      // for each column in row
      row.forEach((col_value, i) => {
        // assign the new object the column value under the correct key
        event[column_names[i]] = col_value;
      });

      // date time string to datetime object
      event.start_date_time = localtoUTCdatetimeobj(
        new Date(event["datetime (YYYY-MM-DD HH:MM:SS)"])
      );
      //create 10 second block for each event
      event.end_date_time = new Date(event.start_date_time.getTime() + 10000);
      // event.className = "case" + event.case
      event.start = event.start_date_time;
      event.end = event.end_date_time;

      var id = i + " event " + event.event;
      event.id = id;
      event.description = event["event"];

      // add video object to data array
      events.push(event);
    });
    if (JSON.stringify($events_store) !== JSON.stringify(events)) {
      $events_store = events;
    }
  }

  function process_video_sheet_response(rows) {
    // first row of table is column names
    let column_names = rows[0];
    // create array to feed data as being processed
    let new_videos = {};

    // for every row (skipping the first row of column names)
    rows.slice(1).forEach((row, r) => {
      try {
        // create a video object
        let video = {};
        // for each column in row
        row.forEach((col_value, i) => {
          // assign the new object the column value under the correct key

          // if the col value a string boolean
          if (col_value == "TRUE" || col_value == "FALSE") {
            // transform string boolean to actual boolean
            video[column_names[i]] = col_value == "TRUE";
            // if boolean not already in filter_toggles (only need to do once on first row)
            // and checkig if already in there prevents from re-adding + resetting to false
            // at every sheet fetch
            if (
              r == 0 &&
              !Object.keys($filter_toggles).includes(column_names[i])
            ) {
              $filter_toggles[column_names[i]] = false;
            }
          } else {
            video[column_names[i]] = col_value;
          }
        });

        // properties for map
        if (
          video[$platform_config_store["Title of column used for latitude"]] &&
          video[$platform_config_store["Title of column used for longitude"]]
        ) {
          video.lat = parseFloat(
            video[$platform_config_store["Title of column used for latitude"]]
          );
          video.long = parseFloat(
            video[$platform_config_store["Title of column used for longitude"]]
          );
        }

        // properties for timeline
        video.type = "range";
        video.label = video.UAR;
        video.id = video.UAR;
        video.url = $platform_config_store["Title of column used for url"];

        // date time string to datetime object
        if (
          video[
            $platform_config_store["Title of column used for chronolocation"]
          ] &&
          video[$platform_config_store["Title of column used for duration"]]
        ) {
          try {
            video.duration =
              video[
                $platform_config_store["Title of column used for duration"]
              ];
            video.start = localtoUTCdatetimeobj(
              new Date(
                video[
                  $platform_config_store[
                    "Title of column used for chronolocation"
                  ]
                ]
              )
            );
            let [length_hours, length_minutes, length_seconds] =
              video[
                $platform_config_store["Title of column used for duration"]
              ].split(":");
            video.end_date_time =
              new Date(video.start).getTime() +
              length_hours * 60 * 60 * 1000 +
              length_minutes * 60 * 1000 +
              length_seconds * 1000;
            video.times = [
              {
                starting_time: new Date(video.start).getTime(),
                ending_time: new Date(video.end_date_time).getTime(),
              },
            ];

            video.end = video.end_date_time;
          } catch {
            console.log("conversion to datetime failed");
            return;
          }
        }

        // // properties for filter
        // Object.entries($filter_toggles).forEach((pair) => {
        //   let [toggle, value] = pair;
        //   if (typeof value === "object") {
        //     let responses = video[toggle];
        //     if (responses == undefined) return;
        //     responses = responses.replaceAll(" ", "");
        //     responses
        //       .split(",")
        //       .filter((response) => {
        //         return !["", " ", "NULL"].includes(response);
        //       })
        //       .forEach((response) => {
        //         if (!Object.keys(value).includes(response)) {
        //           value[response] = false;
        //         }
        //       });
        //   }
        //   $filter_toggles[toggle] = value;
        // });

        new_videos[video.UAR] = video;
      } catch (error) {
        console.log(error);
      }
    });

    if (JSON.stringify($media_store) !== JSON.stringify(new_videos)) {
      $media_store = new_videos;
    }
  }

  // Takes datetime object created on local machine with time offset
  // returns datetime object in UTC time when read by same local machine
  function localtoUTCdatetimeobj(datetimeobj) {
    let userTimezoneOffset = datetimeobj.getTimezoneOffset() * 60000;
    return new Date(datetimeobj.getTime() - userTimezoneOffset);
  }
</script>

<svelte:head>
  <title>Investigative Platform</title>
  <meta name="robots" content="noindex nofollow" />
  <html lang="en" />
</svelte:head>
<main on:mousemove={handleMouseMove}>
  {#await fetch_google_sheet_data()}
    <p>fetching initial data from the spreadsheet...</p>
  {:then}
    {#if $platform_config_store["Source of media files"] && $platform_config_store["Source of media files"].includes("local")}
      <LocalMediaInput />
    {/if}
    <Tooltip {mouse_xy} />
    <Topbar />
    <Modules />
  {:catch error}
    <p>Something went wrong, please reload the page</p>
    <p>{error.message}</p>
  {/await}
</main>

<style>
  * {
    font-family: "Nunito", sans-serif;
    color: lightgray !important;
    /* background-color: rgb(94, 94, 94) */
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }

  main {
    background-color: rgb(27, 27, 27);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  ::-webkit-scrollbar {
    display: none;
    width: 0px; /* Remove scrollbar space */
    background: transparent; /* Optional: just make scrollbar invisible */
  }

  :global(input:focus),
  :global(select:focus),
  :global(textarea:focus),
  :global(button:focus) {
    outline: none;
  }
</style>
