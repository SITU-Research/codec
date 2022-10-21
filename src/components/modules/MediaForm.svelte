<script>
  import { fly } from "svelte/transition";
  import { ui_store } from "../../stores/store";
  export let medium;
</script>

{#if $ui_store.open_form.includes(medium.UAR)}
  <div
    id="media-form"
    class="noselect"
    in:fly={{ x: 200, duration: 100 }}
    out:fly={{ x: 200, duration: 100 }}
  >
    <div class="module_topbar">
      <div class="module_title text_level1">Options</div>
    </div>
    <div class="media-form-content">
      <form>
        {#each Object.entries(medium.contentAnalysis) as [contentTitle, value]}
          <div class="media-form-item">
            <label class="label_text" for={contentTitle}>{contentTitle}</label>
            {#if typeof value == "boolean"}
              <input name={contentTitle} type="checkbox" checked={value}/>
            {:else if !isNaN(value)}
              <input name={contentTitle} type="number" value={value}/>
            {:else}
              <textarea name={contentTitle} placeholder="Content Description" value={value}/>
            {/if}
          </div>
        {/each}
        <button type="submit">Submit changes</button>
      </form>
    </div>
  </div>
{/if}

<style>
  #media-form {
    display: flex;
    flex-direction: column;
    background-color: white;
    width: 50%;
    overflow-y: scroll;
    margin: 10px;
    border-radius: 7px;
  }

  .module_topbar {
    display: flex;
    margin: 5px;
    justify-content: center;
  }

  .module_title {
    font-size: 16px;
  }

  .media-form-item {
    padding: 5px;
    }

  label {
    padding: 5px;
    padding-left: 20px;
  }

  textarea {
    margin-left: 20px;
    height: 50px;
    border: 1px solid;
  }

  button {
    border: 1px solid;
    border-radius: 7px;
    float: right;
    margin: 10px;
  }
</style>
