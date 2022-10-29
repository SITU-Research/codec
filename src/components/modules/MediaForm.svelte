<script lang="ts">
  import { media_store } from '../../stores/store';
  export let medium;
  let expanded = false;

</script>

<div class={`media-form-container ${expanded?"expanded":""}`}>
    <div class="module_topbar" on:click={() => {expanded = !!!expanded}}>
      <div class="module_title text_level1"><div class="arrow">«</div>Options</div>
    </div>
    <div class="media-form-content">
      <form>
        {#each Object.keys(medium.contentAnalysis) as contentTitle}
          <div class="media-form-item">
            {#if typeof $media_store[medium.UAR][contentTitle] == "boolean"}
                <input name={contentTitle} type="checkbox" bind:checked={$media_store[medium.UAR][contentTitle]}/>
                <label class="label_text" for={contentTitle}>{contentTitle}</label>
            {:else if typeof $media_store[medium.UAR][contentTitle] == "number"}
                <label class="label_text" for={contentTitle}>{contentTitle}</label>
                <input name={contentTitle} type="number" bind:value={$media_store[medium.UAR][contentTitle]}/>
            {:else}
                <h3 class="label_text" for={contentTitle}>{contentTitle}</h3>
                <textarea name={contentTitle} rows=3 placeholder="describe what you see in the image in a short sentence" bind:value={$media_store[medium.UAR][contentTitle]}/>
            {/if}

          </div>
        {/each}
      </form>
      <slot></slot>
    </div>
</div>

<style>
 .media-form-container {
   display: flex;
   flex-direction: column;
   background-color: white;
   direction: rtl; /* ladies and gents: DA HACK */
   width: 20px;

   overflow: visible;
   margin: 10px;
   border-radius: 7px;
   transition: all 200ms;
 }
 .media-form-container.expanded {
     width: 20%;
 }
 .media-form-content {
     width: 100%;
     display:flex;
     direction: ltr;
     flex-direction: column;
     opacity: 0;
 }
 .expanded .media-form-content {
     opacity: 1;
 }
 .module_topbar {
     display: flex;
     margin: 5px;
     justify-content: flex-start;
 }
 .module_topbar .module_title {
     display: flex;
     font-size: 16px;
     transform: translateX(30px) translateY(25px) rotate(90deg);
     transition: all 200ms;
 }

 .expanded .module_topbar .module_title {
   transform: rotate(0deg);
 }

 .arrow {
     position: relative;
     float: right;
     transform: rotate(-90deg);
 }
 .expanded .arrow {
     transform: rotate(-180deg);
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

 textarea::placeholder {
     color: lightgray;
 }

 button {
     border: 1px solid;
     border-radius: 7px;
     float: right;
     margin: 10px;
 }
</style>
