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
	<section style="line-height: normal; text-align: center; margin-bottom: 1rem;">
		<p>Welcome to my website.</p>
		<p>My name is Lee Jia Keat, a software engineer based in Singapore.</p>
	</section>
	
	<h2 style="font-size: larger; margin-bottom: 2rem;">Click <a style="text-decoration: underline" href="/projects">here</a> to see my work</h2>

	<p>Find me on:</p>
	<section>
		<a
			href="
		https://www.linkedin.com/in/leejiakeat/
		"
			target="_blank"
			rel="noopener noreferrer"
		>
			<img
				src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"
				alt="Lee Jia Keat's LinkedIn Profile"
			/>
		</a>
		<a href="https://github.com/ksxjltze" target="_blank">
			<img
				src="https://img.shields.io/badge/GitHub-333333?style=for-the-badge&logo=github&logoColor=white"
				alt="Lee Jia Keat's GitHub Profile"
			/></a
		>
	</section>
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
