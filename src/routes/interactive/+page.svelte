<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { createSceneWithContainer, resize, lockControls, destroyScene } from '$lib/scene';

	let surface: HTMLCanvasElement;
	let container: HTMLDivElement;
	let css3DRenderSurface: HTMLDivElement;
	let uiOverlay: HTMLDivElement;
	let occludeCanvas: HTMLCanvasElement;

	onMount(() => {
		surface.width = container.clientWidth;
		surface.height = container.clientHeight;

		createSceneWithContainer(surface, container, css3DRenderSurface, uiOverlay, occludeCanvas);

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

	<script type="x-shader/x-vertex" id="occludevertex">
		uniform vec3 u_points[4];
		uniform vec3 u_camera_pos;
		uniform float u_distances[4];

		varying vec3 v_points[4];
		varying float v_occluding;
		
		void main() {
			vec4 pos = modelMatrix * vec4(position, 1.0);
			float distance_to_camera = length(pos.xyz - u_camera_pos);

			for (int i = 0; i < 4; ++i) {
				vec4 point = projectionMatrix * viewMatrix * vec4(u_points[i], 1.0);

				if (point.w > 0.0)
					v_points[i] = point.xyz / point.w;
			}

			v_occluding = 0.0;
			for (int i = 0; i < 4; ++i) {
				v_occluding = min(v_occluding, u_distances[i] - distance_to_camera);
			}

			gl_Position = projectionMatrix * viewMatrix * pos;
		}
	</script>

	<script type="x-shader/x-fragment" id="occludefragment">
		uniform vec2 u_resolution;
		varying vec3 v_points[4];
		varying float v_occluding;

		vec3 edge_eqn(vec2 p0, vec2 p1) {
			//a, b, c
			return vec3(p0.y - p1.y, p1.x - p0.x, p0.x * p1.y - p1.x * p0.y);
		}

		bool point_in_edge(vec3 edge_eq, vec2 p) {
			if ((edge_eq.x * p.x + edge_eq.y * p.y + edge_eq.z) >= 0.0)
				return true;

			return false;
		}

		void main() {
			if (v_occluding < 0.0)
				discard;

			vec2 st = gl_FragCoord.xy / u_resolution;
			vec2 points[4];
			
			for (int i = 0; i < 4; ++i) {
				points[i] = vec2((v_points[i].xy + 1.0) / 2.0);
			}

			vec3 e0 = edge_eqn(points[0], points[1]);
			vec3 e1 = edge_eqn(points[1], points[3]);
			vec3 e2 = edge_eqn(points[3], points[2]);
			vec3 e3 = edge_eqn(points[2], points[0]);

			if (point_in_edge(e0, st) && point_in_edge(e1, st) && point_in_edge(e2, st) && point_in_edge(e3, st))
				gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
			else
				discard;
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
	<canvas id="occludeCanvas" bind:this={occludeCanvas} />

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
					origin: 'https://leejiakeat.online'
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

	#occludeCanvas {
		position: fixed;
		top: 0;
		left: 0;
		outline: none;
		width: 100vw;
		height: 100vh;

		z-index: -2;
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
