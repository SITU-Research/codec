<script>
    let about_in_view = false;
</script>

<button
    id="about_text"
    class="text_level1 noselect"
    on:click={() => {
        about_in_view = !about_in_view;
    }}><span> about </span></button
>

{#if about_in_view}
    <div
        class="modal_container"
        on:click={() => {
            about_in_view = !about_in_view;
        }}
    >
        <div class="box modal_content text_level2">
            <p>About</p>
        </div>
    </div>
{/if}

<style>
    #about_text {
        color: var(--grey2);
        text-align: center;
        margin-left: auto;
    }

    span {
        display: inline-block;
        vertical-align: middle;
        line-height: normal;
        padding: 1px 0;
    }
</style>
