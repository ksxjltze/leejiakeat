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
		window.addEventListener('dblclick', onFullScreenChange);
	});

	let onFullScreenChange = () => {
		surface.requestFullscreen().then(() => {
			surface.width = window.innerWidth;
			surface.height = window.innerHeight;
			resize();
			lockControls();
		});
	};
</script>

<section class="flex flex-col gap-4">
	<h1>Projects</h1>
	<section class="flex items-center justify-center">
		<p>
			You can find my old portfolio website here: <a href="https://ksxjltze.github.io"
				>ksxjltze.github.io</a
			>
		</p>

		<p style="margin-bottom: -0.5rem;">
			<strong>Double click</strong> anywhere to enter full screen mode.
		</p>
		<p>Press <strong>ESC</strong> to exit full screen mode.</p>
	</section>

	<div bind:this={container} class="w-full" style="height: 600px">
		<canvas bind:this={surface} />
	</div>

	<section>
		<h2>The following project files are ported from my old portfolio website:</h2>
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
</style>
