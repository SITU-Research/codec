<script>
    import { platform_config_store } from "../../stores/store";
    let report_chapter_idx = 0;
    let currentTime = 0;

    $: report_chapters = $platform_config_store["Report video chapters"]
        .split("\n")
        .map((chapter_string) => {
            let time_string = chapter_string.slice(0, 5);
            let time_s =
                parseInt(time_string.slice(0, 3)) * 60 +
                parseInt(time_string.slice(3));
            let title_string = chapter_string.slice(6);
            return [time_s, title_string];
        });

    let onPrevClick = () => {
        report_chapter_idx = report_chapter_idx - 1;
        skipToChapter();
    };

    let onNextClick = () => {
        report_chapter_idx = report_chapter_idx + 1;
        skipToChapter();
    };

    let skipToChapter = () => {
        currentTime = report_chapters[report_chapter_idx][0];
    };
</script>

<div id="report_module">
    <!-- svelte-ignore a11y-media-has-caption -->
    <video controls bind:currentTime>
        <source
            src={$platform_config_store["Report video url"]}
            type="video/mp4"
        />
    </video>
    <div id="report_controls">
        <button
            class="box text_level2 noselect"
            on:click={onPrevClick}
            disabled={report_chapter_idx <= 0}>previous</button
        >
        <h1 class="text_level1">{report_chapters[report_chapter_idx][1]}</h1>
        <button
            class="box text_level2 noselect"
            on:click={onNextClick}
            disabled={report_chapter_idx >= report_chapters.length - 1}
            >next</button
        >
    </div>
</div>

<style>
    #report_module {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
        color: white;
    }

    #report_controls {
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-evenly;
        align-items: center;
        color: white;
    }

    video {
        flex-grow: 2;
        max-width: 100%;
        max-height: 100%;
    }

    button {
        color: white;
        outline-color: white;
    }

    button:disabled {
        cursor: not-allowed;
        color: var(--grey2);
        outline-color: var(--grey2);
    }
</style>
