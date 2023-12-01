<script>
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>Lee Jia Keat</h1>
</section>

<section class="home-content">
	<p>Welcome to my website.</p>
	<p>My name is Lee Jia Keat, a software engineer based in Singapore.</p>
</section>

<style lang="postcss">
	.home-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		margin-top: 1rem;
	}
</style>
