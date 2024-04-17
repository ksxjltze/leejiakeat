<script>
	import { page } from '$app/stores';
	import logo from '$lib/images/svelte-logo.svg';
	import github from '$lib/images/github.svg';
	import { onMount } from 'svelte';

	let showSideNav = false;

	onMount(() => {
		document.addEventListener('pointerup', (pointerEvent) => {
			const sideNav = document.getElementById('side-nav-bar');

			if (!sideNav) return;

			if (pointerEvent.target instanceof Node) {
				if (!sideNav.contains(pointerEvent.target)) {
					showSideNav = false;
				}
			}
		});
	});
</script>

<header>
	<div style="margin-left: 0.5rem;" class="corner">
		<button
			class="mobile imgButton"
			on:click={() => {
				showSideNav = !showSideNav;
			}}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true" style="fill: white;">
				<path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
			</svg>
		</button>
		<a class="not-mobile" href="https://www.linkedin.com/in/leejiakeat/"
			><img
				style="margin-top: 0.5rem;"
				src="/images/In-Blue-26.png"
				alt="Lee Jia Keat's LinkedIn profile"
			/></a
		>
	</div>

	<nav class="navbar">
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0.5,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
				<a href="/">Home</a>
			</li>
			<li aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>
				<a href="/about">About</a>
			</li>
			<li aria-current={$page.url.pathname === '/projects' ? 'page' : undefined}>
				<a href="/projects">Projects</a>
			</li>
			<li class="mobile-hide" aria-current={$page.url.pathname === '/interactive' ? 'page' : undefined}>
				<a href="/interactive">Interactive</a>
			</li>
			<li class="mobile-hide" aria-current={$page.url.pathname === '/blog' ? 'page' : undefined}>
				<a href="/blog">Blog</a>
			</li>
			<li class="mobile-hide" aria-current={$page.url.pathname === '/games' ? 'page' : undefined}>
				<a href="/games">Games</a>
			</li>
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1.5,2 L2,0 Z" />
		</svg>
	</nav>

	<section class="mobile">
		<nav id="side-nav-bar" class="side-nav" hidden={!showSideNav}>
			<ul>
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
			</ul>
		</nav>
	</section>

	<div class="corner">
		<a href="https://github.com/ksxjltze">
			<img src={github} alt="GitHub" />
		</a>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	.navbar {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 1);
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	.navbar > ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li[aria-current='page']::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--color-theme-1);
	}

	.navbar a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--color-theme-1);
	}

	.mobile {
		display: none;
	}

	.imgButton {
		border: none;
		background: none;
	}

	@media only screen and (max-width: 600px) and (orientation: portrait) {
		.mobile-hide {
			display: none;
		}

		.mobile {
			display: inherit !important;
		}

		.not-mobile {
			display: none !important;
		}

		.side-nav {
			position: fixed;

			z-index: 1;
			left: 0;
			top: 0;

			height: 100%;
			width: 33%;

			background-color: white;
		}

		.side-nav > ul {
			display: flex;
			flex-direction: column;
			gap: 1rem;

			margin-left: -1rem;
		}

		.side-nav > ul > li {
			transform: scale(1);
			transition: transform 0.2s ease;
			padding-left: 1rem;
		}

		.side-nav > ul > li:hover {
			transform: scale(1.1);
			transition: transform 0.2s ease;
		}

		.mobile li[aria-current='page']::before {
			--size: 6px;
			content: '';
			width: 0;
			height: 0;
			position: absolute;

			top: 0.1rem;
			left: 0;

			border: var(--size) solid transparent;
			border-left: var(--size) solid var(--color-theme-1);
		}
	}
</style>
