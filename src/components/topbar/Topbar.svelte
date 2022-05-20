<script>
    import Filter from "./Filter.svelte";
    import Finder from "./Finder.svelte";
    import ModuleTools from "./ModuleTools.svelte";
</script>

<div id="top_bar">
    <Filter />
    <Finder />
    <ModuleTools />
</div>

<style>
    #top_bar {
        height: var(--topbar-size);
        width: 100%;
        display: flex;
        flex-flow: row nowrap;
        z-index: 4;
        margin-bottom: var(--grid-size);
    }
</style>
