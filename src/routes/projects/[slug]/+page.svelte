<script lang=ts>
    export let data: any;
</script>

<article style="display: flex; flex-direction: column;">
    <section id="project-info">
        <h1>{data.title}</h1>
        <p>Date: {data.date}</p>
        {#if data.lastUpdated}
            <p>Last Updated: {data.lastUpdated}</p>
        {/if}
        {#if data.src}
            <p><a href="{data.src}">Source: {data.src}</a></p>
        {/if}
    </section>
    <svelte:component this={data.content} />
</article>

<style lang="postcss">
    h1 {
        margin-bottom: 1rem;
    }

    :global(article > h2) {
        all: unset;

        font-weight: bold;
        font-size: x-large;
        text-decoration: underline;
        margin-top: 1rem;
    }

    :global(article > h3) {
        all: unset;

        font-weight: bold;
        font-size: large;

        margin-top: 2rem;
        margin-bottom: 1rem;
    }

    :global(article > h4) {
        all: unset;
        font-weight: bold;
        
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
    }

    :global(article > h5) {
        all: unset;
        margin: auto;
    }
</style>