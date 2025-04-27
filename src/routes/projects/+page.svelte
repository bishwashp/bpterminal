<!-- src/routes/projects/+page.svelte -->
<div class="page-content projects-page">
    <h1>Projects</h1>
    <p>A selection of projects I've worked on. Use <code>cat projects</code> for a quick overview.</p>

    <section class="project-item">
        <h2>Project 1: Terminal Website (This Site!)</h2>
        <p>A personal website built with SvelteKit, designed to mimic a Linux terminal interface.</p>
        <ul>
            <li><strong>Technologies:</strong> SvelteKit, TypeScript, CSS</li>
            <li><strong>Features:</strong> Command-line navigation, theme customization, typewriter effect, responsive design.</li>
            <li><strong>Status:</strong> In Progress</li>
            <li><strong>Link:</strong> [Link to Repo if public, e.g., GitHub]</li>
        </ul>
    </section>

    <section class="project-item">
        <h2>Project 2: [Your Project Name]</h2>
        <p>[Brief description of the project and its purpose.]</p>
        <ul>
            <li><strong>Technologies:</strong> [List key technologies]</li>
            <li><strong>Features:</strong> [Highlight key features or accomplishments]</li>
            <li><strong>Status:</strong> [Completed / In Progress / Maintained]</li>
            <li><strong>Link:</strong> [Link to live demo or repository]</li>
        </ul>
    </section>

    <section class="project-item">
        <h2>Project 3: [Another Project Name]</h2>
        <p>[Brief description.]</p>
         <ul>
            <li><strong>Technologies:</strong> [...]</li>
            <li><strong>Features:</strong> [...]</li>
            <li><strong>Status:</strong> [...]</li>
            <li><strong>Link:</strong> [...]</li>
        </ul>
    </section>

</div>

<style>
    .page-content {
        padding: 2rem;
    }
    .projects-page section {
        margin-bottom: 2rem;
        padding-left: 1rem;
        border-left: 2px solid var(--primary-color);
    }
     .projects-page h2 {
        margin-bottom: 0.5rem;
        font-size: 1.4rem;
    }
    .projects-page ul {
        list-style: none;
        padding-left: 1rem; /* Indent details */
        margin-top: 0.5rem;
    }
    .projects-page li::before {
        content: "- "; /* Use dash for list items */
        color: var(--primary-color);
    }
    .projects-page code {
        background-color: rgba(128, 128, 128, 0.2);
        padding: 0.1em 0.3em;
        border-radius: 3px;
    }
     .projects-page strong {
        /* Optional: Style strong tag if needed */
        font-weight: bold;
        /* color: var(--primary-color); */
    }
</style> 