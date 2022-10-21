<script lang="ts">
  import { onMount } from "svelte";
  import { throttle } from "underscore";
  import LocalMediaInput from "./components/LocalMediaInput.svelte";
  import Topbar from "./components/topbar/Topbar.svelte";
  import Tooltip from "./components/Tooltip.svelte";
  import Modules from "./components/modules/Modules.svelte";
  import FilterPanel from "./components/modules/FilterPanel.svelte";
  import {
    media_store,
    events_store,
    ui_store,
    filter_toggles,
    platform_config_store,
  } from "./stores/store";

  // parameters
  const fetch_interval_ms = 30000;

  // variables
  let mouse_xy = { x: 0, y: 0 };
  let handleMouseMove = throttle((event) => {
    mouse_xy.x = event.clientX;
    mouse_xy.y = event.clientY;
  }, 5);

  const CONTENT_ANALYSIS_FIRST_COLUMN = 12;

  let width_mod_grid = Math.floor(document.body.clientWidth / 10) * 10;
  let height_mod_grid = Math.floor(document.body.clientHeight / 10) * 10;

  let handleWindowResize = throttle(() => {
    width_mod_grid = Math.floor(document.body.clientWidth / 10) * 10;
    height_mod_grid = Math.floor(document.body.clientHeight / 10) * 10;
  }, 500);

  onMount(() => {
    let fetch_interval = setInterval(
      fetch_google_sheet_data,
      fetch_interval_ms
    );
    return () => {
      clearInterval(fetch_interval);
    };
  });

  function fetch_google_sheet_data() {
    let assets_requests = [];
    return fetch(
      `/.netlify/functions/googlesheets?request=platformconfig&offset=1`
    )
      .then((rows_string) => rows_string.json())
      .then((platform_config) => {
        $platform_config_store = platform_config;
        fetch(
          `/.netlify/functions/googlesheets?request=size_` +
            platform_config["Title of tab with media assets"] +
            `&offset=` +
            platform_config["Rank of assets row with column names"]
        )
          .then((assets_info) => assets_info.json())
          .then((assets_info) => {
            let n_necessary_requests = assets_info.total_size / 5500000.0; // max size is 6k, doing 5.5k for padding
            let n_rows_per_requests = Math.floor(
              assets_info.n_rows / n_necessary_requests
            );

            let request_row_start = 0;
            for (let r = 0; r < Math.floor(n_necessary_requests); r++) {
              assets_requests.push({
                start: request_row_start,
                end: request_row_start + n_rows_per_requests,
              });
              request_row_start += n_rows_per_requests + 1;
            }
            let n_rows_last_request = assets_info.n_rows - request_row_start;

            assets_requests.push({
              start: request_row_start,
              end: request_row_start + n_rows_last_request,
            });

            return assets_requests;
          })
          .then((assets_requests) => {
            let media = [];

            let request_range = (assets_request) =>
              fetch(
                `/.netlify/functions/googlesheets?request=` +
                  platform_config["Title of tab with media assets"] +
                  `&offset=` +
                  platform_config["Rank of assets row with column names"] +
                  `&rangeStart=` +
                  assets_request.start +
                  `&rangeEnd=` +
                  assets_request.end
              );

            return assets_requests.reduce(
              (p, assets_request) =>
                p
                  .then(() => request_range(assets_request))
                  .then((rows_string) => rows_string.json())
                  .then((rows) => {
                    media = media.concat(rows);
                    return media;
                  }),
              Promise.resolve()
            );
          })
          .then((media) => {
            process_video_sheet_response(media);
          })
          .then(() => {
            fetch(
              `/.netlify/functions/googlesheets?request=` +
                platform_config["Title of tab with events"] +
                `&offset=` +
                platform_config["Rank of events row with column names"]
            )
              .then((rows_string) => rows_string.json())
              .then((events) => {
                process_event_sheet_response(events);
              });
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
        new Date(event["datetime (yyyy-mm-dd hh:mm:ss)"])
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

    /* 
      TODO: 
      -design the column index using platform config
      -Define pros and cons
    */
    // separate rows related to content analysis
    let content_analysis_columns = column_names.filter(
      (elem, index) => index >= CONTENT_ANALYSIS_FIRST_COLUMN
    );

    // create array to feed data as being processed
    let new_videos = {};

    // for every row (skipping the first row of column names)
    rows.slice(1).forEach((row, r) => {
      try {
        // create a video object
        let video = {};
        // define contentAnalysis object
        video.contentAnalysis = {};
        // for each column in row
        row.forEach((col_value, i) => {
          // assign the new object the column value under the correct key

          // assign to contentAnalysis
          if (content_analysis_columns.includes(column_names[i])) {
            // transform spaces into _ (we)
            video.contentAnalysis[column_names[i]] =
              col_value == "TRUE" || col_value == "FALSE"
                ? col_value == "TRUE"
                : col_value;
          }

          if (col_value == "TRUE" || col_value == "FALSE") {
            // if the col value a string boolean

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

        // some UARs have _V at the end
        if (video.UAR.slice(video.UAR.length - 2) == "_V") {
          video.UAR = video.UAR.slice(0, video.UAR.length - 2);
        }

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

<svelte:window on:resize={handleWindowResize} />
<svelte:head>
  <title>Investigative Platform</title>
  <meta name="robots" content="noindex nofollow" />
  <html lang="en" />
</svelte:head>

<FilterPanel />
<Tooltip {mouse_xy} />

<main
  on:mousemove={handleMouseMove}
  style="width:{width_mod_grid}px; height:{height_mod_grid}px; left:{$ui_store.filter_in_view
    ? `var(--filtermenu-size)`
    : `0`} "
>
  {#await fetch_google_sheet_data()}
    <div class="modal_container">
      <div class="box modal_content text_level2">
        fetching initial data from the spreadsheet...
      </div>
    </div>
  {:then}
    {#if $platform_config_store["Source of media files"] && $platform_config_store["Source of media files"].includes("local")}
      <LocalMediaInput />
    {/if}
    <Topbar />
    <Modules />
  {:catch error}
    <div class="modal_container">
      <div class="box modal_content text_level2">
        <p>something went wrong, see below for error</p>
        <p>{error.message}</p>
        <p>please reload the page</p>
      </div>
    </div>
  {/await}
</main>

