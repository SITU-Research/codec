<script>
    import { ui_store, filter_toggles } from "../../stores/store";
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
        <div
            class="filter_toggle"
            on:click={() => {
                $filter_toggles[filter] = !value;
            }}
        >
            <form>
                <label for="+">
                    <input type="radio" checked={value} />
                    <span>+</span>
                </label>
                <label for="-">
                    <input type="radio" checked={!value} />
                    <span>-</span>
                </label>
            </form>
            <span class="label_text" style="color:{value ? 'white' : ''}"
                >{filter}</span
            >
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

    .filter_toggle {
        padding: var(--grid-size) 0;
    }

    form {
        display: inline;
    }

    label {
        display: inline;
        padding: 5px;
        position: relative;
        padding-left: 20px;
    }

    label input {
        display: none;
    }

    label span {
        border: 1px solid var(--grey2);
        width: 15px;
        height: 15px;
        position: absolute;
        overflow: hidden;
        line-height: 1;
        text-align: center;
        border-radius: 100%;
        font-size: 10pt;
        left: 0;
        top: 50%;
        margin-top: -7.5px;
    }

    input:checked + span {
        background: white;
        border-color: white;
    }

    .label_text {
        text-transform: capitalize;
    }
</style>
