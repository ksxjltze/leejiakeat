<script lang=ts>
	import '/src/app.css';
	export let data;

	import * as THREE from 'three';
    import { onMount } from 'svelte';
    import { Scene } from "$lib/scene";

    let surface: HTMLCanvasElement;
    let container: HTMLDivElement;

	onMount(() => {
        let scene: Scene = new Scene();
        surface.width = container.clientWidth;
        surface.height = container.clientHeight;
		scene.createSceneWithContainer(surface, container);
	});
</script>

<section class="flex flex-col gap-4">
	<h1>Projects</h1>
	<section class="flex items-center justify-center">
		<p class="m-auto">
			You can find my old portfolio website here: <a href="https://ksxjltze.github.io"
				>ksxjltze.github.io</a
			>
		</p>
	</section>

    <div bind:this={container} class="w-full" style="height: 600px">
        <canvas bind:this={surface}></canvas>
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
</style>
