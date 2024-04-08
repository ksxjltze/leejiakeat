<script lang=ts>
    export let data: any;
</script>

<article style="display: flex; flex-direction: column;">
    <section id="project-info">
        <h1>{data.title}</h1>
        <p>Date: {data.date}</p>
    </section>
    <svelte:component this={data.content} />
</article>

<style lang="postcss">
</style>