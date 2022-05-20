<script>
    import { ui_store } from "../../stores/store";
    import Timeline from "./Timeline.svelte";
    import Map from "./Map.svelte";
    import Media from "./Media.svelte";

    export let module;

    let modules_options = {
        media: Media,
        map: Map,
        timeline: Timeline,
    };

    function toggle_module(module) {
        if ($ui_store.modules_in_view.includes(module)) {
            $ui_store.modules_in_view = $ui_store.modules_in_view.filter(
                (module_in_view) => module_in_view !== module
            );
        } else {
            $ui_store.modules_in_view = [...$ui_store.modules_in_view, module];
        }
    }
</script>

<div
    class="box module {module}_module"
    style="display:{$ui_store.modules_in_view.includes(module)
        ? 'flex'
        : 'none'}"
>
    <div class="module_topbar">
        <div class="module_title text_level1">{module}</div>
        <div
            class="module_close"
            on:pointerdown={(e) => e.stopPropagation()}
            on:click={() => toggle_module(module)}
        >
            &#215;
        </div>
    </div>
    <div class="module_content">
        <svelte:component this={modules_options[module]} />
    </div>
</div>

<style>
    .module {
        display: flex;
        flex-flow: column nowrap;
        flex-grow: 1;
        margin-bottom: var(--grid-size);
    }

    .media_module {
        flex: 1 0 100%;
    }

    .timeline_module {
        margin-right: var(--grid-size);
    }

    .module_topbar {
        width: 100%;
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        justify-items: stretch;
        align-items: center;
    }

    .module_topbar > * {
        line-height: 30px;
        width: 30px;
        height: 30px;
    }

    .module_title {
        flex-grow: 2;
    }

    .module_close {
        cursor: pointer;
    }

    .module_content {
        flex-grow: 2;
        min-width: 0;
        min-height: 0;
    }
</style>
