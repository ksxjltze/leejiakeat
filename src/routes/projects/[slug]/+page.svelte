<script lang=ts>
    export let data: any;
</script>

<article>
    <h1>{data.title}</h1>
    <p>Date: {data.date}</p>
    <svelte:component this={data.content} />
</article>