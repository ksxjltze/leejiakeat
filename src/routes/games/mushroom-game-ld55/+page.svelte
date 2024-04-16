<script>
	let game_width = 1280;
	let game_height = 720;
</script>

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

<style>
	.game-embed {
		height: var(--game-height);
	}

	#mushroom-game-iframe {
		position: absolute;
		left: calc((var(--game-width) / 4));
		margin-top: 1rem;
	}
</style>
