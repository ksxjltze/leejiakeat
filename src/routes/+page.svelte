<script>
	import { onMount } from 'svelte';

	onMount(async () => {
		const script = document.createElement('script');
		script.src = '//cdn.credly.com/assets/utilities/embed.js';
		document.head.appendChild(script);
	});
</script>

<svelte:head>
	<title>Lee Jia Keat</title>
	<meta name="description" content="Lee Jia Keat" />
</svelte:head>

<section>
	<h1>Lee Jia Keat</h1>
</section>

<section class="home-content">
	<section style="line-height: normal; text-align: center; margin-bottom: 1rem;">
		<p>Welcome to my humble website.</p>
		<p>
			My name is Jia Keat, a software engineer based in Singapore. I'm a CS RTIS graduate
			from the DigiPen Institute of Technology Singapore. I love all things technology. Currently, I particularly enjoy making games.
		</p>
	</section>

	<section>
		<p>See my new website here: <a href="https://www.leejiakeat.online">https://www.leejiakeat.online</a></p>
	</section>

	<section id="overview-section" class="section-space-bottom">
		<div id="overview-panel" class="panel-darken mobile-flex-col">
			<img id="leejiakeat-photo" src="/images/lee-jia-keat.png" alt="Lee Jia Keat">
			<section id="panel-info">
				<div id="panel-info-skills">
					<h3><u>Skills</u></h3>
					<ul class="list-no-style">
						<li>Full-stack Web Development</li>
						<li>Game Programming</li>
						<li>Graphics Programming</li>
					</ul>
				</div>
				<div>
					<h3><u>Tools</u></h3>
					<ul class="list-no-style">
						<li>Git</li>
						<li>Visual Studio</li>
						<li>Visual Studio Code</li>
						<li>IntelliJ IDEA</li>
						<li>Unity</li>
						<li>Blender</li>
					</ul>
				</div>
				<div>
					<h3><u>Languages</u></h3>
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
					<h3><u>Web Frameworks</u></h3>
					<ul class="list-no-style">
						<li>Angular</li>
						<li>Spring</li>
						<li>Svelte(kit)</li>
						<li>ThreeJS</li>
					</ul>
				</div>
			</section>
		</div>
	</section>

	<h2 style="font-size: larger; padding: 1rem; margin-bottom: 1rem;">
		Click <a style="text-decoration: underline" href="/projects">here</a> to see my work
	</h2>

	<section id="certifications-and-badges-section" class="section-space-bottom">
		<h2 class="section-title">Badges</h2>
		<p>View my credly profile <a href="https://www.credly.com/users/jia-keat-lee">here</a></p>
		<div id="badges" class="section-space-bottom">
			<div data-iframe-width="150" data-iframe-height="270" data-share-badge-id="73b16c98-cbe5-49ec-abdf-5525e8fd4dd5" data-share-badge-host="https://www.credly.com">
			</div>
			<div data-iframe-width="150" data-iframe-height="270" data-share-badge-id="16aa2158-2525-469b-8c2a-70711ea79c5a" data-share-badge-host="https://www.credly.com">
			</div>
		</div>

		<h2 class="section-title">Certifications</h2>
		<div id="certifications">
			<ul>
				<li>
					<a href="https://cp.certmetrics.com/amazon/en/public/verify/credential/bcec2818b9804b5b8aa41033fa66426e">
						AWS Certified Cloud Practitioner
					</a>
				</li>
			</ul>
		</div>
	</section>

	<h2 class="section-title">Contact</h2>
	<section id="contact" class="section-space-bottom">
		<div>
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
		</div>
		<section style="display: flex; flex-direction: column; align-items: center;">
			<p style="margin: auto; margin-top: 0.25rem;"><a style="color:white" href="mailto:leejiakeat@gmail.com">leejiakeat@gmail.com</a></p>
			<p style="margin: auto; margin-top: 0.25rem;"><a style="color:white" href="sms:+6588935543">+65 8893 5543</a></p>
		</section>
	</section>
	
	<h2 class="section-title">Resume</h2>
	<embed style="width: 100%;" src="/resume/LeeJiaKeat.pdf" height="950" type="application/pdf"/>
</section>

<style lang="postcss">
	.home-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		margin-top: 1rem;
	}

	#contact {
		background-color: #555;
		padding: 1rem;
		border-radius: 8px;
	}

	.section-space-bottom {
		margin-bottom: 2rem;
	}

	#leejiakeat-photo {
		width: 50%;
		height: fit-content;
		
		margin: auto;
		border-radius: 8px;
	}

	#badges {
		display: flex;
		gap: 1rem;
	}

	#overview-section {
		margin: auto;
		width: 100%;

		display: flex;
		align-items: center;
	}

	#overview-panel {
		width: 100%;
		border: 1px solid #fff;
		border-radius: 8px;

		display: flex;
		align-items: center;

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

	.section-title
	{
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	#certifications-and-badges-section {
		display: flex;
		flex-direction: column;

		align-items: center;
	}

	@media only screen and (max-width: 600px) {
		#leejiakeat-photo {
			/* display: none; */
			width: 100%;
		}

		.mobile-flex-col {
			flex-direction: column;
		}
	}
</style>
