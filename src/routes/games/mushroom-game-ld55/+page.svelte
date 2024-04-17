<script>
	let game_width = 1280;
	let game_height = 720;
</script>

<div class="project-link">
	<a href="/projects/MushroomGameLD55"><h1>Mushroom Game LD55</h1></a>
</div>

<section class="game-embed" style='--game-width:{game_width}px; --game-height:{game_height}px'>
	<iframe
		title="Mushroom Game LD55"
		id="mushroom-game-iframe"
		src="/game-assets/mushroom-game/index.html"
		scrolling="no"
		width={game_width}
		height={game_height}
	/>
</section>

<div class="game-controls">
	<h2 class="controls-header">How to play</h2>
	<ol>
		<li>Click to spawn mushrooms.</li>
		<li>Buy upgrades for mushrooms.</li>
		<li>Accumulate enough spores to summon big boi.</li>
		<li>Defeat enemy hero.</li>
		<li>Profit?</li>
	</ol>
</div>

<style>
	.game-embed {
		height: var(--game-height);
	}

	#mushroom-game-iframe {
		position: absolute;
		left: calc((var(--game-width) / 4));
		margin-top: 1rem;
	}

	.game-controls {
		margin-block-start: 2rem;
	}

	.controls-header {
		font-size: x-large;
		text-decoration: underline;
	}
	
	li {
		line-height: 1.5rem;
	}
</style>
