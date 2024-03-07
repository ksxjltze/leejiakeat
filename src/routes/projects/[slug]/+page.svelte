<script lang=ts>
    export let data: any;
</script>

<article style="display: flex; flex-direction: column;">
    <h1>{data.title}</h1>
    <p>Date: {data.date}</p>
    <a href="{data.src}">Source: {data.src}</a>
    <svelte:component this={data.content} />
</article>

<style lang="postcss">
    h1 {
        margin-bottom: 1rem;
    }

    img {
        margin: auto;
    }
</style>