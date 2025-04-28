<!-- src/routes/about/+page.svelte -->
<div class="page-content about-page">
	<h1>About Me</h1>

	<section class="bio">
		<h2>Bio</h2>
		<p>
			Hello! I'm [Your Name/Alias], a [Your Profession/Role] based in [Your Location/Remote]. I
			specialize in [Your Key Areas of Expertise, e.g., web development, system administration,
			etc.]. This website is a personal project to showcase my skills and interests in a unique,
			terminal-inspired format.
		</p>
		<p>
			My journey into [Your Field] started back in [Year/Time Period]. Since then, I've been
			passionate about [Specific Interests, e.g., clean code, open-source, cybersecurity, etc.]. I
			enjoy tackling challenging problems and continuously learning new technologies.
		</p>
	</section>

	<section class="skills">
		<h2>Skills & Expertise</h2>
		<ul>
			<li>Languages: [List Languages, e.g., JavaScript, TypeScript, Python, Bash]</li>
			<li>Frameworks/Libraries: [List Frameworks, e.g., Svelte, React, Node.js]</li>
			<li>Tools: [List Tools, e.g., Git, Docker, Linux, Nginx]</li>
			<li>Databases: [List Databases, e.g., PostgreSQL, MongoDB]</li>
			<li>Cloud: [List Cloud Platforms, e.g., AWS, GCP]</li>
			<li>Other: [Any other relevant skills]</li>
		</ul>
	</section>
</div>

<style>
	.page-content {
		padding: 2rem;
	}
	.about-page section {
		margin-bottom: 2rem;
	}
	.about-page h2 {
		border-bottom: 1px solid var(--primary-color);
		padding-bottom: 0.5rem;
		margin-bottom: 1rem;
		font-size: 1.4rem;
	}
	.skills ul {
		list-style: none;
		padding-left: 1rem;
	}
	.skills li::before {
		content: '- ';
		color: var(--primary-color);
		margin-right: 0.5rem;
	}
</style>
