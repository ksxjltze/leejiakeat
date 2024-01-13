<script>
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>Lee Jia Keat</h1>
</section>

<section class="home-content">
	<section style="line-height: normal; text-align: center; margin-bottom: 1rem;">
		<p>Welcome.</p>
		<p>
			My name is Jia Keat, an aspiring software engineer based in Singapore. I'm a graduating
			student from the DigiPen Institute of Technology Singapore, and specialize in building
			real-time interactive software.
		</p>
	</section>

	<h2 style="font-size: larger; margin-bottom: 2rem;">
		Click <a style="text-decoration: underline" href="/projects">here</a> to see my work
	</h2>

	<section id="overview-section">
		<div id="overview-panel" class="panel-darken">
			<img id="leejiakeat-photo" src="/images/lee-jia-keat.png" alt="Lee Jia Keat">
			<section id="panel-info">
				<div id="panel-info-skills">
					<h3>Skills</h3>
					<ul class="list-no-style">
						<li>Full-stack Web Development</li>
						<li>Game Programming</li>
						<li>Graphics Programming</li>
					</ul>
				</div>
				<div>
					<h3>Tools</h3>
					<ul class="list-no-style">
						<li>Git</li>
						<li>Visual Studio</li>
						<li>Visual Studio Code</li>
						<li>IntelliJ IDEA</li>
					</ul>
				</div>
				<div>
					<h3>Languages</h3>
					<ul class="list-no-style">
						<li>C/C++</li>
						<li>Java</li>
						<li>C#</li>
						<li>Python</li>
						<li>HTML, CSS</li>
						<li>JavaScript/TypeScript</li>
						<li>GLSL</li>
					</ul>
				</div>
				<div>
					<h3>Frameworks</h3>
					<ul class="list-no-style">
						<li>Angular</li>
						<li>Spring</li>
						<li>Svelte(kit)</li>
					</ul>
				</div>
			</section>
		</div>
	</section>

	<section id="certifications-and-badges-section">
		<h3>Certifications and Badges</h3>
		<div>
			<div data-iframe-width="150" data-iframe-height="270" data-share-badge-id="73b16c98-cbe5-49ec-abdf-5525e8fd4dd5" data-share-badge-host="https://www.credly.com">
			</div>
			<script type="text/javascript" async src="//cdn.credly.com/assets/utilities/embed.js"></script>
		</div>
	</section>

	<p>Find me on:</p>
	<section>
		<a href="https://www.linkedin.com/in/leejiakeat/" target="_blank">
			<img
				src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"
				alt="Lee Jia Keat's LinkedIn Profile"
			/>
		</a>
		<a href="https://github.com/ksxjltze" target="_blank">
			<img
				src="https://img.shields.io/badge/GitHub-333333?style=for-the-badge&logo=github&logoColor=white"
				alt="Lee Jia Keat's GitHub Profile"
			/></a
		>
	</section>
</section>

<style lang="postcss">
	.home-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		margin-top: 1rem;
	}

	#leejiakeat-photo {
		width: 50%;
		height: fit-content;
		
		margin: auto;
		border-radius: 8px;
	}

	#overview-panel {
		width: 100%;
		border: 1px solid #fff;
		border-radius: 8px;
		padding: 1rem 2rem;

		display: flex;
		column-gap: 2rem;
		position: relative;

		box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
		filter: contrast(1.2) brightness(0.9) saturate(1.2);
	}

	.panel-darken::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			rgba(0, 0, 0, 0.1),
			rgba(0, 0, 0, 0.1)
		);
		pointer-events: none;
		z-index: -1;
	}

	#panel-info {
		width: 50%;
		margin: auto;

		display: flex;
		flex-direction: column;
		/* gap: 1rem; */

		/* filter: drop-shadow(0 0 0.075rem #ff5511); */
	}

	.list-no-style {
		padding: 0;
		list-style: none;
	}

	#certifications-and-badges-section {
		margin-top: 3rem;
		display: flex;
		flex-direction: column;

		align-items: center;
	}
</style>
