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
        height: 4%;
        display: flex;
        flex-flow: row nowrap;
        z-index: 4;
    }
</style>
