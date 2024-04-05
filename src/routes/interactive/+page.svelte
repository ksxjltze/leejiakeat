<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import {
		createSceneWithContainer,
		resize,
		lockControls,
		destroyScene
	} from '$lib/scene';

	let surface: HTMLCanvasElement;
	let container: HTMLDivElement;
	let css3DRenderSurface: HTMLDivElement;
	let uiOverlay: HTMLDivElement;

	onMount(() => {
		surface.width = container.clientWidth;
		surface.height = container.clientHeight;

		createSceneWithContainer(surface, container, css3DRenderSurface, uiOverlay);

		window.addEventListener('click', lockControls);
		window.addEventListener(
			'fullscreenchange',
			() => {
				resize();
				lockControls();
			},
			false
		);

		const ytIFrameAPIScript = document.createElement('script');
		ytIFrameAPIScript.id = 'iframe-demo';
		ytIFrameAPIScript.src = 'https://www.youtube.com/iframe_api';
		container.append(ytIFrameAPIScript);
	});

	onDestroy(() => {
		destroyScene();
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

<div
	bind:this={container}
	style="position:fixed; left:0; top:0; width: 100%; height: 100%; z-index: 1;"
>
	<canvas bind:this={surface} />
	<div id="css3DSurface" class="overlay" bind:this={css3DRenderSurface} />
	<div id="iframe-yt-embed" />
	<div id="uiOverlay" class="overlay z-index-3" bind:this={uiOverlay} />

	<script type="text/javascript">
		function onPlayerReady(event) {
			console.log('Youtube Player ready!');
		}

		var ytPlayer;
		function onYouTubePlayerAPIReady() {
			ytPlayer = new YT.Player('iframe-yt-embed', {
				height: '1920',
				width: '1080',
				videoId: 'BCFzNFtZF_E',
				playerVars: {
					enablejsapi: 1,
					origin: "https://leejiakeat.online"
				},
				events: {
					onReady: onPlayerReady
				}
			});
		}
	</script>
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

	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		outline: none;
		width: 100vw;
		height: 100vh;

		z-index: 2;
	}

	.z-index-3 {
		z-index: 3;
	}
</style>
