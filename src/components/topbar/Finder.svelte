<script>
    import { ui_store, media_store } from "../../stores/store";
    let input, response;

    function onKeyup(event) {
        let key = event.key || event.keyCode;
        if (key === 13 || key === "Enter") {
            run_search_query(input.value);
        }
    }

    function run_search_query() {
        response.innerHTML = "";
        let result = $media_store[input.value];
        if ($ui_store.media_in_view.includes(input.value)) {
            response.innerHTML = "media already displayed";
        } else if (result) {
            $ui_store.media_in_view = [...$ui_store.media_in_view, input.value];
        } else {
            response.innerHTML = "query not found";
        }
    }
</script>

<div class="box" id="find_video_area">
    <input
        bind:this={input}
        id="find_video_input"
        type="text"
        on:keyup={onKeyup}
        placeholder="SEARCH MEDIA"
    />
    <button id="find_video_button" on:click={run_search_query}
        ><img src="icons/magnifying_glass.svg" alt="search icon" /></button
    >
    <div bind:this={response} id="find_video_response" />
</div>

<style>
    #find_video_area {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        margin-left: 20px;
        height: (--topbar-size);
    }

    #find_video_area > input {
        /* height: 60%; */
        /* border: 1px solid #ccc; */
        /* background-color: rgb(100, 100, 100); */
        /* border-collapse: collapse; */
    }

    #find_video_button {
        border: none;
        display: inline-block;
        cursor: pointer;
        /* color: lightgray; */
    }

    #find_video_response {
        margin-left: 10px;
        font-size: small;
    }
</style>
