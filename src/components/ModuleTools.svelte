<script>
    import { ui_store } from "../stores/store";

    function request_add_module() {
        dispatch("addModule");
    }
</script>

<button on:click={(event) => ($ui_store.add_module_request = "Map")}
    >add map</button
>
<button on:click={(event) => ($ui_store.add_module_request = "Timeline")}
    >add timeline</button
>

<style>
    button {
        border: 1px solid #ccc;
        background-color: black;
        display: inline-block;
        cursor: pointer;
        color: lightgray;
    }
</style>
