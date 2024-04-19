<script lang="ts">
	export let data: any;
</script>

<article class="blog" style="display: flex; flex-direction: column;">
	<section id="project-info">
		<h1>{data.title}</h1>
		<p>Date: {data.date}</p>
	</section>
	<svelte:component this={data.content} />
</article>

<style lang="postcss">
	:global(article.blog h2) {
		font-size: x-large;
		text-decoration: underline;

		margin-block-start: 1rem;
		margin-block-end: 0;
		margin-inline-start: 0px;
		margin-inline-end: 0px;
	}
    
    :global(article.blog .figure-label) {
        all: unset;
        font-style: italic;
        margin-bottom: 1rem;
    }

	:global(article.blog .figure-image) {
		margin-bottom: 1rem;
	}

	:global(article.blog .image-half-size) {
		width: 50%;
		height: 50%;
	}
</style>
