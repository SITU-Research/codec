<script lang="ts">
    import FilterButton from "./FilterButton.svelte";
    import Finder from "./Finder.svelte";
    import ModuleTools from "./ModuleTools.svelte";
    import About from "./About.svelte";
    import Logo from "./Logo.svelte";
</script>

<div id="top_bar">
    <FilterButton />
    <div class="vl" />
    <ModuleTools />
    <Finder />
    <About />
    <div class="vl" />
    <Logo />
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

    .vl {
        border-left: 1px solid var(--grey2);
        height: 100%;
        margin: 1px var(--grid-size);
    }
</style>
