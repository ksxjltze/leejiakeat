<script lang="ts">
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

		onRequestFullScreen();
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

<section>
    <h2>This is highly recommended to be experienced in fullscreen.</h2>
    <p>
        <strong>Double click</strong> anywhere to enter full screen mode.
    </p>
    <button on:click={onFullscreenButtonClick}>Or click me</button>
    <p>Press <strong>ESC</strong> to exit full screen mode.</p>
    <p>Instructions:</p>
    <ul>
        <li>WASD to move</li>
        <li>Space to ascend, shift to descend</li>
        <li>Mouse to look around (fullscreen)</li>
    </ul>
</section>

<div bind:this={container} class="w-full" style="height: 600px">
    <canvas bind:this={surface} />
</div>

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

</style>