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
					<div id="hero" class="border-radius-large hero-height">
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

		<section style="margin-top: 1rem; margin-bottom: 1rem;">
			<h3>Interactive Portfolio (WIP)</h3>
			<p>
				Click
				<a href="/interactive"> here </a>
				to view my projects in an immersive mode (WIP). Or just explore the world I've created.
			</p>
		</section>

		<hr style="width: 100%; margin: auto;" />

		<section id="projects-list">
			<h1>All Projects</h1>
			<div class="project-grid">
				{#each projects as project, i}
					<div class="project-grid-item">
						<a class="project-grid-item-link" href={project.path}
							><img alt="project icon" src={project.meta.background} /></a
						>
						<a class="project-grid-item-link" href={project.path}><p>{project.meta.title}</p></a>
					</div>
				{/each}
			</div>
		</section>
	</section>
</section>

<style lang="postcss">
	.project-grid {
		display: flex;
		flex-wrap: wrap;

		width: 100%;
		column-gap: 2rem;
		row-gap: 0.5rem;

		align-items: center;
		justify-content: center;
	}

	.project-grid-item-link {
		width: 100%;

		display: flex;
		flex-direction: column;

		align-items: center;
		justify-content: center;
	}

	.project-grid-item-link img {
		transition: transform 0.25s ease;
	}

	.project-grid-item-link img:hover {
		transform: scale(1.05);
		filter: drop-shadow(0 0 0.5rem #ffffff);
	}

	.project-grid-item {
		width: 100%;
		flex: 0 0 calc(1 / 3 * 100% - 2rem);
	}

	.project-grid-item img {
		width: 100%;
		height: 12rem;

		border-radius: 8px;
	}

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

		background-color: #000;
		transition: transform 0.5s cubic-bezier(0.075, 0.82, 0.165, 1),
			filter 1s cubic-bezier(0.075, 0.82, 0.165, 1), border 0.5s ease-in-out;
	}

	.hero-height {
		height: 32rem;
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
		border-radius: 1rem;
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
		#hero {
			margin-bottom: 1rem;
		}

		#project-heroes {
			padding-top: 0;
		}

		.project-grid-item {
			flex: 0 0 calc(100% - 2rem);
		}

		.project-grid-item-link p {
			margin-top: 0.5rem;
		}

		.hero-height {
			height: 15rem;
		}
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
