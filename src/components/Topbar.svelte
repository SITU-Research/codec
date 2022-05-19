<script>
    import Filter from "./topbar/Filter.svelte";
    import Finder from "./topbar/Finder.svelte";
    import ModuleTools from "./topbar/ModuleTools.svelte";
</script>

<div id="top_bar">
    <Filter />
    <Finder />
    <ModuleTools />
</div>

<style>
    #top_bar {
        height: var(--topbar-size);
        display: flex;
        flex-flow: row nowrap;
        z-index: 4;
    }
</style>
