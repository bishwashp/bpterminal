<!-- src/routes/about/+page.svelte -->
<div class="page-content about-page">
    <h1>About Me</h1>
    
    <section class="bio">
        <h2>Bio</h2>
        <p>
            Hello! I'm [Your Name/Alias], a [Your Profession/Role] based in [Your Location/Remote]. 
            I specialize in [Your Key Areas of Expertise, e.g., web development, system administration, etc.].
            This website is a personal project to showcase my skills and interests in a unique, 
            terminal-inspired format.
        </p>
        <p>
            My journey into [Your Field] started back in [Year/Time Period]. Since then, I've been passionate about 
            [Specific Interests, e.g., clean code, open-source, cybersecurity, etc.]. 
            I enjoy tackling challenging problems and continuously learning new technologies.
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

    <section class="command-guide">
        <h2>Website Command Guide</h2>
        <p>Navigate this site using the command prompt below or on the home page:</p>
        <ul>
            <li><code>help</code> - Display list of all available commands.</li>
            <li><code>help &lt;command&gt;</code> - Show description for a specific command.</li>
            <li><code>ls</code> - List available pages (simulates listing directory contents).</li>
            <li><code>cd &lt;page&gt;</code> - Change directory to the specified page (e.g., <code>cd projects</code>).</li>
            <li><code>cat &lt;page&gt;</code> - Display basic content overview for a page (e.g., <code>cat about</code>).</li>
            <li><code>clear</code> - Clear the terminal output (on the home page).</li>
            <li><code>date</code> - Display the current date and time.</li>
            <li><code>list-fonts</code> - Show available fonts for customization.</li>
            <li><code>set-font &lt;index|name&gt;</code> - Change the website font.</li>
            <li><code>set-theme &lt;#primaryHex&gt; &lt;#secondaryHex&gt;</code> - Set primary text and background colors.</li>
            <li><code>reset-theme</code> - Reset colors and font to default.</li>
        </ul>
         <p>Use <code>Tab</code> or <code>Right Arrow</code> to accept suggestions.</p>
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
    .skills ul, .command-guide ul {
        list-style: none;
        padding-left: 1rem;
    }
    .skills li::before, .command-guide li::before {
        content: "- ";
        color: var(--primary-color);
        margin-right: 0.5rem;
    }
    .command-guide code {
        background-color: rgba(128, 128, 128, 0.2);
        padding: 0.1em 0.3em;
        border-radius: 3px;
    }
</style> 