<script>
  import { local_file_store, platform_config_store } from "../../stores/store";
  import {
    sync_time,
    sync_paused,
    sync_time_origin_UAR,
  } from "../../stores/sync_time_store";
  export let medium;

  let src;
  let used_filepath;
  let video_time = 0;
  let video_duration = 0;
  let video_seek_value = 0;
  let paused = true;
  let muted = true;
  let volume = 0.2;
  if ($platform_config_store["Source of media files"].includes("local")) {
    try {
      used_filepath = $local_file_store[medium.UAR].name;
      src = URL.createObjectURL($local_file_store[medium.UAR]);
    } catch {
      src = null;
    }
  } else {
    used_filepath =
      medium[$platform_config_store["Title of column used for url"]];
    src = used_filepath;
  }

  let handleOnPlayButton = () => {
    paused = !paused;
    if (paused !== $sync_paused) {
      console.log("--------------");
      console.log("sending pause/play", {
        origin: medium.UAR,
        sync_paused: false,
      });
      $sync_paused = paused;
      $sync_time_origin_UAR = medium.UAR;
    }
  };

  let handleOnSeekInteract = () => {
    var vidTime = (video_duration * video_seek_value) / 100.0;
    video_time = vidTime;

    let new_time = new Date(
      medium.start.getTime() + Math.floor(video_time * 1000)
    );
    if (new_time !== $sync_time) {
      console.log("--------------");
      console.log("sending seek", {
        origin: medium.UAR,
        sync_time: new_time,
      });
      $sync_time = new_time;
      $sync_time_origin_UAR = medium.UAR;
    }
  };

  let handleVideoOnTimeUpdate = () => {
    video_seek_value = (video_time / video_duration) * 100;
  };

  let handleOnMuteButtonClick = () => {
    muted = !muted;
  };

  sync_time.subscribe((sync_time) => {
    if (
      $sync_time_origin_UAR !== medium.UAR &&
      sync_time.getTime() > medium.start.getTime() &&
      sync_time.getTime() < medium.end.getTime()
    ) {
      console.log("receiving seek", {
        origin: $sync_time_origin_UAR,
        receiver: medium.UAR,
        sync_time: sync_time,
      });
      video_time = (sync_time.getTime() - medium.start.getTime()) / 1000;
    }
  });

  sync_paused.subscribe((sync_paused) => {
    if (
      $sync_time_origin_UAR !== medium.UAR &&
      $sync_time.getTime() > medium.start.getTime() &&
      $sync_time.getTime() < medium.end.getTime()
    ) {
      console.log("receiving pause", {
        origin: $sync_time_origin_UAR,
        receiver: medium.UAR,
        sync_paused: sync_paused,
      });
      paused = sync_paused;
    }
  });
</script>

{#if src !== null}
  {#if used_filepath.toLowerCase().includes("mp4") || used_filepath
      .toLowerCase()
      .includes("mov") || used_filepath.toLowerCase().includes("webm")}
    <div class="medium_video" id={medium.id}>
      <div class="video_wrapper">
        <!-- svelte-ignore a11y-media-has-caption -->
        <video
          {src}
          type="video/mp4"
          bind:currentTime={video_time}
          bind:duration={video_duration}
          bind:paused
          bind:muted
          bind:volume
          on:timeupdate={handleVideoOnTimeUpdate}
        />
        <div class="controls_bar">
          <button class="box text_level1" on:click={handleOnPlayButton}
            >{paused ? "Play" : "Pause"}</button
          >
          <input
            type="range"
            min="0"
            max="100"
            bind:value={video_seek_value}
            class="slider"
            on:input={handleOnSeekInteract}
          />
          <button class="box text_level1" on:click={handleOnMuteButtonClick}
            >{muted ? "Unmute" : "Mute"}</button
          >
          <input
            type="range"
            min="0"
            step="0.001"
            max="1"
            bind:value={volume}
            class="slider"
          />
        </div>
      </div>
    </div>
  {:else if used_filepath.includes("png") || used_filepath.includes("jpeg") || used_filepath.includes("jpg") || used_filepath.includes("webp")}
    <div class="medium_image" id={medium.id}>
      <!-- svelte-ignore a11y-missing-attribute -->
      <img {src} />
    </div>
  {/if}
{/if}

<style>
  .video_wrapper {
    width: 100%;
    max-height: 40vh;
    margin: 0 auto;
    overflow: hidden;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
  }

  .medium_image {
    height: 40vh;
    display: flex;
    flex-flow: column;
    flex-direction: row;
    justify-content: center;
  }

  video {
    height: 30vh;
  }

  button {
    height: 10%;
  }

  .controls_bar {
    display: flex;
    flex-flow: row nowrap;
  }

  :root {
    --seekbar-pre-color: rgb(80, 80, 80);
    --seekbar-post-color: rgb(201, 201, 201);
  }

  @media screen and (-webkit-min-device-pixel-ratio: 0) {
    input[type="range"] {
      overflow: hidden;
      width: 80px;
      -webkit-appearance: none;
      background-color: var(--seekbar-post-color);
    }

    input[type="range"]::-webkit-slider-runnable-track {
      height: 10px;
      -webkit-appearance: none;
      color: var(--seekbar-pre-color);
    }

    input[type="range"]::-webkit-slider-thumb {
      width: 10px;
      -webkit-appearance: none;
      height: 10px;
      cursor: ew-resize;
      background: #434343;
      box-shadow: -80px 0 0 80px var(--seekbar-pre-color);
    }
  }
  /** FF*/
  input[type="range"]::-moz-range-progress {
    background-color: var(--seekbar-pre-color);
  }
  input[type="range"]::-moz-range-track {
    background-color: var(--seekbar-post-color);
  }
  /* IE*/
  input[type="range"]::-ms-fill-lower {
    background-color: var(--seekbar-pre-color);
  }
  input[type="range"]::-ms-fill-upper {
    background-color: var(--seekbar-post-color);
  }
</style>
