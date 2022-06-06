<script>
    import { ui_store, filter_toggles } from "../../stores/store";

    function onCheckboxChange(event, filter, possible_value) {
        $filter_toggles[filter][possible_value] = event.target.checked;
    }
</script>

<div
    id="filter_menu"
    class="noselect"
    style="left:{$ui_store.filter_in_view ? `0px` : `-400px`}"
>
    <div class="module_topbar">
        <div class="module_title text_level1">filter</div>
        <div
            class="module_close"
            on:click={() => ($ui_store.filter_in_view = false)}
        >
            &#215;
        </div>
    </div>
    {#each Object.entries($filter_toggles) as [filter, value]}
        <div>
            <input
                type="checkbox"
                checked={value ? true : false}
                on:change={() => {
                    $filter_toggles[filter] = !value;
                }}
            />{filter}
        </div>
    {/each}
</div>

<style>
    #filter_menu {
        position: absolute;
        top: 0;
        width: var(--filtermenu-size);
        box-sizing: border-box;
        height: 100vh;
        background-color: black;
        padding: calc(2 * var(--grid-size));
        display: flex;
        flex-flow: column nowrap;
        justify-items: center;
        justify-content: flex-start;
        transition: 0.5s;
        overflow: hidden;
    }

    .module_topbar {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        justify-items: stretch;
        align-items: center;
    }

    .module_topbar > * {
        line-height: calc(2 * var(--grid-size));
        height: calc(2 * var(--grid-size));
    }

    .module_title {
        flex-grow: 2;
    }

    .module_close {
        cursor: pointer;
        width: 30px;
    }

    .filter_toggles {
        border: 1px solid #ccc;
        cursor: pointer;
        padding: 6px 12px;
        width: 75%;
    }

    .filter_toggle_on {
        background-color: white;
        color: black;
    }

    .filter_toggle_off {
        background-color: black;
        color: white;
    }

    li {
        color: white;
    }
</style>
