<script>
  import { local_file_store } from "../stores/store";

  let input_container, media_input;

  function onMediaInputChange() {
    input_container.innerHTML = "<h4>Loading the medias...</h4>";
    // convert from weird html format to array
    let media_files_array = Array.from(media_input.files);

    // for each media file selected, add it to the media_files object with its code as key
    media_files_array.forEach((media) => {
      // find the file extension location in the filename string
      let period_index = media.name.indexOf(".");
      // cut out the file extension
      let media_code = media.name.slice(0, period_index);
      // add the media file into the media_files object
      $local_file_store[media_code] = media;
    });
    // when done, remove the input html element from the page
    input_container.remove();
  }

  function onInputBypassClick() {
    input_container.remove();
  }
</script>

<div id="input_container" bind:this={input_container}>
  <h4>
    In order to load the medias locally, please navigate and select them all
    from your computer.
  </h4>
  <label for="media_input">
    <div class="custom_media_input">Select media</div>
  </label>
  <input
    id="media_input"
    multiple
    type="file"
    bind:this={media_input}
    on:change={onMediaInputChange}
  />
  <div id="input_bypass" on:click={onInputBypassClick}>
    Bypass local medias input
  </div>
</div>

<style>
  #input_container {
    position: absolute;
    z-index: 10;
    height: 100%;
    width: 100%;
    left: 0;
    top: 0;
    text-align: center;
    vertical-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    margin: 0;
  }

  .custom_media_input,
  #input_bypass {
    border: 1px solid #ccc;
    display: inline-block;
    padding: 6px 12px;
    cursor: pointer;
  }

  #media_input {
    display: none;
  }
</style>
