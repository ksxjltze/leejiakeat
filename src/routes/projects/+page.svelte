<script lang="ts">
	import '/src/app.css';
	export let data;

	import * as THREE from 'three';
	import { onMount } from 'svelte';
	import { createSceneWithContainer, resize, lockControls } from '$lib/scene';

	let surface: HTMLCanvasElement;
	let container: HTMLDivElement;

	onMount(() => {
		surface.width = container.clientWidth;
		surface.height = container.clientHeight;

		createSceneWithContainer(surface, container);
		window.addEventListener('dblclick', onRequestFullScreen);
	});

	let onRequestFullScreen = () => {
		surface.requestFullscreen().then(() => {
			surface.width = window.innerWidth;
			surface.height = window.innerHeight;
			resize();
			lockControls();
		});
	};

	let onFullscreenButtonClick = () => {
		onRequestFullScreen();
	};
</script>

<section class="flex flex-col gap-4">
	<section class="flex items-center justify-center">
		<section id="project-heroes">
			<a class="w-full" href="/projects/Iconoclasm/">
				<div id="iconoclasm-hero" class="border-radius-large">
					<img src="/images/iconoclasm/iconoclasm-logo.jpg" alt="Iconoclasm Logo">
				</div>
			</a>
		</section>

		<h3>Portfolio (WIP)</h3>
		<p>
			You can find my old portfolio website here: <a href="https://ksxjltze.github.io"
				>ksxjltze.github.io</a
			>
		</p>

		<p>
			<strong>Double click</strong> anywhere to enter full screen mode.
		</p>
		<button on:click={onFullscreenButtonClick}>Or click me</button>
		<p>Press <strong>ESC</strong> to exit full screen mode.</p>
		<p>Instructions:</p>
		<ul>
			<li>WASD to move</li>
			<li>Space to ascend, shift to descend</li>
			<li>Mouse to look around</li>
		</ul>
	</section>

	<div bind:this={container} class="w-full" style="height: 600px">
		<canvas bind:this={surface} />
	</div>

	<section>
		<h1>Archive</h1>
		<h2>The following project files were ported from my old portfolio website:</h2>
		<ul>
			{#each data.posts as post}
				<li class="mb-1">
					<h2>
						<a href={post.path}>
							{post.meta.title}
						</a>
					</h2>
					Date: {post.meta.date}
				</li>
			{/each}
		</ul>
	</section>
</section>

<style lang="postcss">
	canvas:fullscreen {
		position: fixed;
		top: 0;
		left: 0;
		outline: none;
		width: 100vw;
		height: 100vh;
	}

	p {
		line-height: normal;
	}

	button {
		margin: 0 0.5rem;
		border: 1px solid #000;
		border-radius: 0.25rem;
		padding: 0.25rem 0.5rem;
		font-size: 1rem;
		font-weight: 400;
		color: #fff;
		background-color: #ff5511;
	}

	#project-heroes {
		display: flex;
		flex-direction: column;

		align-items: center;
		padding: 1rem 0rem;
	}

	#iconoclasm-hero {
		width: 100%;
		height: fit-content;
		
		display: flex;
		flex-direction: column;
		align-items: center;

		background-color: #000;
		transition: transform 0.5s cubic-bezier(0.075, 0.82, 0.165, 1), filter 1s cubic-bezier(0.075, 0.82, 0.165, 1);
	}

	#iconoclasm-hero:hover {
		transform: scale(1.05);
		filter: drop-shadow(0 0 0.5rem #ff5511);
	}

	.w-full {
		width: 100%;
	}

	.border-radius-small {
		border-radius: 4px;
	}

	.border-radius-medium {
		border-radius: 8px;
	}

	.border-radius-large {
		border-radius: 16px;
	}
</style>
