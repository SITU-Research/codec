<script lang="ts">
    import { ui_store } from "../../stores/store";

    function toggle_module(module) {
        if ($ui_store.modules_in_view.includes(module)) {
            $ui_store.modules_in_view = $ui_store.modules_in_view.filter(
                (module_in_view) => module_in_view !== module
            );
        } else {
            $ui_store.modules_in_view = [...$ui_store.modules_in_view, module];
        }
    }

    let modules = ["map", "timeline", "media"];
</script>

<div id="view_text" class="text_level1 noselect"><span> view: </span></div>

{#each modules as module}
    <button
        class="box text_level1 noselect {$ui_store.modules_in_view.includes(
            module
        )
            ? 'module_button_in_view'
            : ''}"
        on:click={() => toggle_module(module)}>{module}</button
    >
{/each}

<style>
    #view_text {
        color: white;
        text-align: center;
    }

    span {
        display: inline-block;
        vertical-align: middle;
        line-height: normal;
        padding: 1px var(--grid-size) 1px 0;
    }

    button {
        margin-right: var(--font-size);
    }

    .module_button_in_view {
        color: white;
        border: 1px solid white;
    }
</style>
