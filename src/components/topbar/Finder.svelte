<script>
    import { ui_store, media_store } from "../../stores/store";
    let input;
    let input_focused = false;

    function onKeyup(event) {
        let key = event.key || event.keyCode;
        if (key === 13 || key === "Enter") {
            run_search_query(input.value);
        }
    }

    function run_search_query() {
        let result = $media_store[input.value];
        if (result) {
            $ui_store.media_in_view = [...$ui_store.media_in_view, input.value];
        }
    }
</script>

<div class="box {input_focused ? 'finder_focus' : ''}" id="find_video_area">
    <input
        bind:this={input}
        id="find_video_input"
        type="text"
        on:keyup={onKeyup}
        on:focus={() => {
            input_focused = true;
        }}
        on:blur={() => {
            input_focused = false;
        }}
        placeholder="SEARCH MEDIA"
    />
    <button id="find_video_button" on:click={run_search_query}
        ><img src="icons/magnifying_glass.svg" alt="search icon" /></button
    >
</div>

<style>
    #find_video_area {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        margin-left: 20px;
        height: (--topbar-size);
    }

    .finder_focus {
        border-color: white;
        color: white;
    }
</style>
