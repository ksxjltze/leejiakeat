<script>
	import '/src/app.css';
	export let data;
</script>

<section id="blog-posts-list">
    <h1>Blog</h1>
    
	{#each data.posts as post, i}
		<div class="blog-post-item">
			<a class="blog-post-item-link" href={post.path}><h2>{post.meta.title}</h2></a>
			<p class="blog-post-item-date">{post.meta.date}</p>
		</div>
	{/each}
</section>

<style>
	#blog-posts-list h2 {
		font-size: larger;
		font-weight: bold;
	}

	.blog-post-item-date {
        margin-top: -0.5rem;
	}
</style>
