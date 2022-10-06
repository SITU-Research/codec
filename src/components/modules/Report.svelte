<script>
  import { platform_config_store } from "../../stores/store";
  let video_el;
  let progress_bar_el_width;
  let currentTime = 0;
  let duration;
  let paused = true;
  let recentUserPlay = false;

  let report_chapter_idx = 0;
  let recentUserPlayTimeout = 100.0;

  $: report_chapters = $platform_config_store["Report video chapters"]
    .split("\n")
    .map((chapter_string) => {
      let time_string = chapter_string.slice(0, 5);
      let time_s =
        parseInt(time_string.slice(0, 3)) * 60 + parseInt(time_string.slice(3));
      return time_s;
    });

  let onPrevClick = () => {
    // if already at current chapter start, previous takes you to previous
    // otherwise just rewind to beginning of chapter
    if (
      Math.abs(currentTime - report_chapters[report_chapter_idx]) <=
      recentUserPlayTimeout / 1000
    ) {
      report_chapter_idx = Math.max(report_chapter_idx - 1, 0);
    }
    video_el.pause();
    skipToChapter();
  };

  let onNextClick = () => {
    report_chapter_idx = report_chapter_idx + 1;
    skipToChapter();
  };

  let skipToChapter = () => {
    currentTime = report_chapters[report_chapter_idx];
  };

  let handleOnVideoClick = () => {
    if (paused) {
      recentUserPlay = true;
      setTimeout(() => {
        recentUserPlay = false;
      }, recentUserPlayTimeout);
      video_el.play();
    } else {
      video_el.pause();
    }
  };

  let handleOnVideoTimeUpdate = () => {
    report_chapters.forEach((chap, c) => {
      // if current time is within 0.1 of a chapter stopping point
      if (
        Math.abs(currentTime - chap) <= recentUserPlayTimeout / 1000 &&
        !paused &&
        !recentUserPlay
      ) {
        video_el.pause();
        report_chapter_idx = c;
      }
    });
  };

  let handleOnChapterDotClick = (c) => {
    console.log(c);
    report_chapter_idx = c;
    video_el.play();
    skipToChapter();
  };
</script>

<div id="report_module">
  <!-- svelte-ignore a11y-media-has-caption -->
  <video
    bind:this={video_el}
    bind:currentTime
    bind:duration
    bind:paused
    on:click={handleOnVideoClick}
    on:timeupdate={handleOnVideoTimeUpdate}
  >
    <source src={$platform_config_store["Report video url"]} type="video/mp4" />
  </video>
  <div id="report_controls">
    <button
      class="box text_level2 noselect"
      on:click={onPrevClick}
      disabled={currentTime <= 0.5}>previous</button
    >
    <div class="progress_bar" bind:offsetWidth={progress_bar_el_width}>
      <progress value={currentTime / duration || 0} />
      <svg id="chapter_dots">
        {#each report_chapters as chapter, c}
          {#if c > 0 && c < report_chapters.length - 1 && duration}
            <circle
              cx={((chapter / duration) * progress_bar_el_width).toString()}
              cy="5"
              r="5"
              fill={currentTime >= chapter - recentUserPlayTimeout / 1000
                ? "var(--grey2)"
                : "white"}
              style="cursor:pointer"
              on:click={() => {
                handleOnChapterDotClick(c);
              }}
            />
          {/if}
        {/each}
      </svg>
    </div>

    <button
      class="box text_level2 noselect"
      on:click={onNextClick}
      disabled={report_chapter_idx >= report_chapters.length - 1}>next</button
    >
  </div>
</div>

<style>
  #report_module {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    color: white;
  }

  video {
    flex-grow: 2;
    max-width: 100%;
    max-height: 100%;
  }

  #report_controls {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-evenly;
    align-items: center;
    color: white;
  }

  button {
    color: white;
    outline-color: white;
  }

  button:disabled {
    cursor: not-allowed;
    color: var(--grey2);
    outline-color: var(--grey2);
  }

  .progress_bar {
    position: relative;
    width: 60vw;
    height: 10px;
  }

  progress,
  #chapter_dots {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 10px;
  }

  progress::-webkit-progress-value {
    background-color: var(--grey2) !important;
  }
  progress::-moz-progress-bar {
    background-color: var(--grey2) !important;
  }
  progress {
    color: var(--grey2);
    accent-color: var(--grey2);
  }
</style>
