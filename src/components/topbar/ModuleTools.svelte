<script>
    import { ui_store } from "../../stores/store";

    function request_add_module() {
        dispatch("addModule");
    }
</script>

<button
    class="box text_level1 noselect"
    on:click={(event) => ($ui_store.add_module_request = "Map")}>map</button
>
<button
    class="box text_level1 noselect"
    on:click={(event) => ($ui_store.add_module_request = "Timeline")}
    >timeline</button
>

<button
    class="box text_level1 noselect"
    on:click={(event) => ($ui_store.add_module_request = "Media")}>media</button
>

<style>
    button {
        color: var(--grey2);
    }
</style>
