<script lang="ts">
	import { onMount } from 'svelte';
	import { createSceneWithContainer, resize, lockControls } from '$lib/scene';

	let surface: HTMLCanvasElement;
	let container: HTMLDivElement;

	onMount(() => {
		surface.width = container.clientWidth;
		surface.height = container.clientHeight;

		createSceneWithContainer(surface, container);

		window.addEventListener('click', lockControls);
		window.addEventListener('fullscreenchange', () => {
			resize();
			lockControls();
		}, false);
	});
</script>

<section>
	<script type="x-shader/x-vertex" id="vertexshader">

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}

	</script>

	<script type="x-shader/x-fragment" id="fragmentshader">

		uniform sampler2D baseTexture;
		uniform sampler2D bloomTexture;

		varying vec2 vUv;

		void main() {

			gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );

		}

	</script>
</section>

<div bind:this={container} style="position:fixed; left:0; top:0; width: 100%; height: 100%">
	<canvas bind:this={surface} />
</div>

<style lang="postcss">
	canvas {
		position: fixed;
		top: 0;
		left: 0;
		outline: none;
		width: 100vw;
		height: 100vh;
	}
</style>
