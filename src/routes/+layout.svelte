<script>
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { webVitals } from '$lib/vitals';
	import Header from './Header.svelte';
	import '../app.css';
	import './styles.css';

	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { inject } from '@vercel/analytics'

	/** @type {import('./$types').LayoutServerData} */

	export let data;
	injectSpeedInsights();
	inject();

	//@ts-ignore
	$: if (browser && data?.analyticsId) {
		webVitals({
			path: $page.url.pathname,
			params: $page.params,
			//@ts-ignore
			analyticsId: data.analyticsId
		});
	}
</script>

<div class="app">
	<Header />

	<main>
		<slot />
	</main>

	<footer>
		<h2 style="font-size: x-large">Lee Jia Keat</h2>
		<section>
			<nav>
				<ul style="display: flex; flex-direction: row; gap: 1rem; padding-left: 0">
					<li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
						<a href="/">Home</a>
					</li>
					<li aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>
						<a href="/about">About</a>
					</li>
					<li aria-current={$page.url.pathname === '/projects' ? 'page' : undefined}>
						<a href="/projects">Projects</a>
					</li>
					<li aria-current={$page.url.pathname === '/interactive' ? 'page' : undefined}>
						<a href="/interactive">Interactive</a>
					</li>
					<li aria-current={$page.url.pathname === '/blog' ? 'page' : undefined}>
						<a href="/blog">Blog</a>
					</li>
					<li aria-current={$page.url.pathname === '/games' ? 'page' : undefined}>
						<a href="/games">Games</a>
					</li>
				</ul>
			</nav>
		</section>
		<section
			style="width: 100%; display: flex; flex-direction: row; gap: 1rem; align-items: center; justify-content: center;"
		>
			<a href="https://www.linkedin.com/in/leejiakeat/" target="_blank">
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
			<p>
				<a style="color:white; margin: auto;" href="mailto:leejiakeat@gmail.com"
					>leejiakeat@gmail.com</a
				>
			</p>
			<p>
				<a style="color:white; margin: auto;" href="sms:+6588935543">+65 8893 5543</a>
			</p>
		</section>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	li {
		padding: 0;
		list-style: none;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
