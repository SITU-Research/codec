<script>
    import { ui_store } from "../../stores/store";
    import Timeline from "./Timeline.svelte";
    import Map from "./Map.svelte";
    import MediumVideo from "./MediumVideo.svelte";
    import TimelineThree from "./TimelineThree.svelte";

    export let module;
    export let medium;

    let modules_options = {
        media: MediumVideo,
        map: Map,
        timeline: Timeline,
        timelinethree: TimelineThree,
    };

    function close_module(module, medium) {
        // if X on a medium and there is more than one in view
        // just remove medium from view
        if (module.includes("medi") && $ui_store.media_in_view.length > 1) {
            $ui_store.media_in_view = $ui_store.media_in_view.filter(
                (exist_UAR) => exist_UAR !== medium.UAR
            );
        } else {
            $ui_store.modules_in_view = $ui_store.modules_in_view.filter(
                (module_in_view) => module_in_view !== module
            );
            if (module.includes("medi")) {
                $ui_store.media_in_view = $ui_store.media_in_view.filter(
                    (exist_UAR) => exist_UAR !== medium.UAR
                );
            }
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
        <div class="module_title text_level1">
            {module}
            {module.includes("medi") ? ": " + medium?.UAR : ""}
        </div>
        <div
            class="module_close"
            on:pointerdown={(e) => e.stopPropagation()}
            on:click={() => close_module(module, medium)}
        >
            &#215;
        </div>
    </div>
    <div class="module_content">
        <svelte:component this={modules_options[module]} {medium} />
    </div>
</div>

<style>
    .module {
        display: flex;
        flex-flow: column nowrap;
        flex: 1 1 auto;
        margin-bottom: var(--grid-size);
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
        line-height: calc(2 * var(--grid-size));
        height: calc(2 * var(--grid-size));
        width: calc(2 * var(--grid-size));
    }

    .module_title {
        flex-grow: 2;
        margin-left: calc(0.5 * var(--grid-size));
    }

    .module_close {
        cursor: pointer;
    }

    .module_content {
        flex-grow: 2;
        min-width: 0;
        min-height: 0;
    }

    .media_module:not(:first-child) {
        margin-left: var(--grid-size);
    }

    .timeline_module {
        margin-right: var(--grid-size);
    }
</style>
