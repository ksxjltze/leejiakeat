<section id="games-section">
	<h1>Games</h1>
	<a class="game-link" href="/games/mushroom-game-ld55">
		<div class="game-item">
			<img
				class="game-cover-image"
				alt="Mushroom Game LD55"
				src="/images/mushroom-game-ld55/ld55-cover.webp"
			/>
			<b class="game-title">Mushroom Game LD55</b>
			<i class="game-description">Clicker Game, Submission for Ludum Dare 55</i>
		</div>
	</a>
</section>

<style>
	#games-section {
		display: flex;
		flex-direction: column;

		align-items: center;
		justify-content: center;
	}

	.game-item {
		display: flex;
		flex-direction: column;

		align-items: center;
		justify-content: center;

		background-color: #222222;
		padding: 2rem;
		border-radius: 2rem;

		transition: transform 0.5s cubic-bezier(0.075, 0.82, 0.165, 1),
			filter 1s cubic-bezier(0.075, 0.82, 0.165, 1), border 0.5s ease-in-out;
	}

	.game-item:hover {
		transform: scale(1.025);
		filter: drop-shadow(0 0 0.5rem #ffffff);
	}

	.game-cover-image {
		margin-bottom: 2rem;
		border-radius: 1rem;
	}

	.game-title {
		margin-bottom: 1rem;
	}

	.game-description {
		color: white;
	}

	.game-link {
		text-decoration: none;
	}
</style>
