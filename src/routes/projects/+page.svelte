<script>
	import '/src/app.css';
	export let data;

	let index = 0;
	const projects = [...data.posts].sort((a, b) => {
		const pA = a.meta.priority ? a.meta.priority : 999;
		const pB = b.meta.priority ? b.meta.priority : 999;

		return pA - pB;
	});

	const nextCarouselItem = () => {
		index = index + 1 >= projects.length ? index : index + 1;
	};

	const previousCarouselItem = () => {
		index = index - 1 < 0 ? 0 : index - 1;
	};
</script>

<section>
	<section class="projects-section">
		<h1>Projects</h1>
		<h2
			class="project-title"
			style="text-align: center; border-radius: 4px; border: 2px solid white; width: fit-content; margin: auto; padding: 1rem; margin-bottom: 1rem;"
		>
			<b>{projects[index].meta.title}</b>
		</h2>
		<section class="carousel">
			<button
				class="carousel-arrow carousel-arrow-left image-button"
				on:click={() => {
					index = index - 1 < 0 ? 0 : index - 1;
				}}
			>
				<img class="carousel-arrow-image" src="/images/svg/arrow.svg" alt="previous" />
			</button>
			<div id="project-heroes">
				<a class="w-full" href={projects[index].path}>
					<div id="hero" class="border-radius-large">
						<img
							class="hero-image"
							src={projects[index].meta.background
								? projects[index].meta.background
								: '/images/boi.png'}
							alt="Project: {projects[index].title}"
						/>
					</div>
				</a>
			</div>
			<button
				class="carousel-arrow carousel-arrow-right image-button"
				on:click={() => {
					index = index + 1 >= projects.length ? index : index + 1;
				}}
			>
				<img class="carousel-arrow-image" src="/images/svg/arrow.svg" alt="next" />
			</button>

			<section class="carousel-mobile-controls">
				<button
					class="carousel-arrow carousel-arrow-left image-button"
					on:click={previousCarouselItem}
				>
					<img class="carousel-arrow-image" src="/images/svg/arrow.svg" alt="previous" /></button
				>
				<h2 class="project-title">
					<b>{projects[index].meta.title}</b>
				</h2>
				<button
					class="carousel-arrow carousel-arrow-right image-button"
					on:click={nextCarouselItem}
				>
					<img class="carousel-arrow-image" src="/images/svg/arrow.svg" alt="next" /></button
				>
			</section>
		</section>

		<p>
			{projects[index].meta.description
				? projects[index].meta.description
				: 'No description provided.'}
		</p>
		<hr style="width: 100%; margin: auto;" />

		<h3>Interactive Portfolio (WIP)</h3>
		<p>
			Click
			<a href="/interactive"> here </a>
			to view my projects in an interactive mode (WIP). Or just explore the world I've created.
		</p>
	</section>

	<section>
		<h1>Archive</h1>
		<h2>
			The following project files were ported from my old portfolio website, which you can find <a
				href="https://ksxjltze.github.io">here</a
			>:
		</h2>
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
	.projects-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	#project-heroes {
		margin: auto;
		width: 100%;

		display: flex;
		flex-direction: column;

		align-items: center;
		padding: 1rem 0rem;
	}

	#hero {
		margin: auto;
		display: flex;

		flex-direction: column;
		align-items: center;

		justify-content: center;
		height: 32rem;

		background-color: #000;
		transition: transform 0.5s cubic-bezier(0.075, 0.82, 0.165, 1),
			filter 1s cubic-bezier(0.075, 0.82, 0.165, 1), border 0.5s ease-in-out;
	}

	#hero:hover {
		transform: scale(1.025);
		filter: drop-shadow(0 0 0.5rem #ffffff);
	}

	.w-full {
		width: 100%;
	}

	.border-radius-large {
		border-radius: 16px;
	}

	.carousel {
		display: flex;
		flex-direction: row;

		position: relative;
		min-height: 50%;
	}

	.carousel-arrow {
		/* position: absolute;
		top: 25%;
		height: 50%; */

		height: 8rem;
		margin: auto;
		margin-inline-start: 0.5rem;
		margin-inline-end: 0.5rem;
	}

	.carousel-arrow-left:hover {
		transform: scaleX(0.7) scaleY(1.2);
		transition: transform 0.1s ease-in-out;

		filter: drop-shadow(10px 10px 10px #ff3e00);
	}

	.carousel-arrow-left {
		transform: scaleX(0.5);
		filter: drop-shadow(10px 10px 1px black);

		transition: transform 0.25s;
	}

	.carousel-arrow-right:hover {
		transform: rotateZ(180deg) scaleX(0.7) scaleY(1.2);
		transition: transform 0.1s ease-in-out;

		filter: drop-shadow(10px -10px 10px #ff3e00);
	}

	.carousel-arrow-right {
		transform: rotateZ(180deg) scaleX(0.5);
		filter: drop-shadow(10px -10px 1px black);
	}

	.image-button {
		background: transparent;
		border: none;
	}

	.carousel-arrow-image {
		height: 100%;
	}

	.image-button:focus {
		border: none;
		outline: none;
	}

	.hero-image {
		width: 100%;
		height: 100%;

		filter: contrast(110%) brightness(110%);
	}

	.carousel-mobile-controls {
		display: none;
	}

	@media only screen and (min-width: 1080px) {
		.carousel {
			/* lol */
			width: 122.775%;
		}
	}

	@media only screen and (max-width: 600px) {
		.project-title {
			display: none;
		}

		.carousel-arrow {
			display: none;
		}

		.carousel {
			flex-wrap: wrap;
			flex-basis: 100%;
		}

		.carousel-mobile-controls {
			display: block;
			display: flex;
			align-items: center;
			justify-content: space-between;
			width: 100%;
		}

		.carousel-mobile-controls .carousel-arrow {
			display: block;
			height: 4rem;
		}

		.carousel-mobile-controls .project-title {
			display: flex;
			flex-direction: column;
			
			text-align: center;
			width: fit-content;
			margin: auto;
		}
	}
</style>
