<script>
    import { filter_toggles } from "../stores/store";
    let menu_visible = false;

    function onCheckboxChange(event, filter, possible_value) {
        $filter_toggles[filter][possible_value] = event.target.checked;
    }
</script>

<button
    id="filter_button"
    on:click={() => {
        menu_visible = !menu_visible;
    }}>toggle filter menu</button
>
{#if menu_visible}
    <div id="filter_menu">
        {#each Object.entries($filter_toggles) as [filter, value]}
            {#if typeof value === "object"}
                <details>
                    <summary>
                        {filter}
                    </summary>
                    <ul>
                        {#each Object.keys(value) as possible_value}
                            <div>
                                <input
                                    type="checkbox"
                                    checked={value[possible_value]
                                        ? true
                                        : false}
                                    on:change={onCheckboxChange(
                                        event,
                                        filter,
                                        possible_value
                                    )}
                                />
                                {possible_value}
                            </div>
                        {/each}
                    </ul>
                </details>
            {:else}
                <div>
                    <input
                        type="checkbox"
                        checked={value ? true : false}
                        on:change={() => {
                            $filter_toggles[filter] = !value;
                        }}
                    />{filter}
                </div>
            {/if}
        {/each}
    </div>
{/if}

<style>
    * {
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
    }
    #filter_button {
        border: 1px solid #ccc;
        background-color: black;
        display: inline-block;
        z-index: 4;
        /* padding: 6px 12px; */
        cursor: pointer;
        color: lightgray;
    }

    #filter_menu {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.85);
        display: inline-block;
        padding: 40px 12px;
        z-index: 3;
        display: flex;
        flex-flow: column wrap;
        justify-items: center;
        align-items: left;
        justify-content: flex-start;
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
