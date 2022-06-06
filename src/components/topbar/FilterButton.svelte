<script>
    import { ui_store } from "../../stores/store";
</script>

<button
    id="filter_button"
    class="box text_level1 noselect"
    on:click={() => {
        $ui_store.filter_in_view = !$ui_store.filter_in_view;
    }}
>
    filter
</button>

<style>
    #filter_button {
        z-index: 4;
        cursor: pointer;
        height: var(--topbar-size);
    }
</style>
