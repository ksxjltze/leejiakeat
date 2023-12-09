<script lang=ts>
    export let data: any;
</script>

<article>
    <h1>{data.title}</h1>
    <p>Date: {data.date}</p>
    <svelte:component this={data.content} />
</article>

<style lang="postcss">
    h1 {
        margin-bottom: 1rem;
    }
</style>