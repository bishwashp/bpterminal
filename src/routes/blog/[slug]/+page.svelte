<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';
    import { theme } from '$lib/stores/themeStore'; // Access theme for potential styling
    import { onMount } from 'svelte';

    export let data: PageData;
    $: postMeta = data.post; // Contains title, date, tags etc.
    $: tagString = postMeta.tags?.join(', ');

    // Variable to hold the dynamically imported component
    let PostContentComponent: any = null; // Start as null

    // Dynamically import the .md file based on the slug
    onMount(async () => {
        try {
            // Vite supports dynamic imports with variables if the path is somewhat predictable
            const modules = import.meta.glob('/content/blog/*.md');
            const modulePath = `/content/blog/${postMeta.slug}.md`;
            
            if (modules[modulePath]) {
                 const module = await modules[modulePath]() as { default: any }; // Assert type
                 PostContentComponent = module.default; // The Svelte component exported by mdsvex
            } else {
                console.error(`Markdown component not found for slug: ${postMeta.slug}`);
                 // Handle error - perhaps show a message
            }
        } catch (error) {
            console.error('Error dynamically importing post content:', error);
            // Handle error
        }
    });

</script>

<div class="page-content blog-post-page">
    <article>
        <h1>{postMeta.title}</h1>
        <p class="post-meta">
            Published on: {postMeta.date}
            {#if tagString}
                <span class="tags"> | Tags: {tagString}</span>
            {/if}
        </p>
        
        <div class="post-content">
            {#if PostContentComponent}
                <!-- Render the dynamically imported Svelte component -->
                <svelte:component this={PostContentComponent} />
            {:else}
                <!-- Show loading or error state -->
                <p>Loading post content...</p>
                <!-- Or display raw content as fallback if import fails -->
                <!-- <pre><code>{postMeta.content}</code></pre> -->
            {/if}
        </div>
    </article>
    
    <p class="back-link">
        <a href="/blog">&lt;- Back to Blog List</a>
    </p>
</div>

<style>
    .page-content {
        padding: 2rem;
        max-width: 800px; /* Limit width for readability */
        margin: 0 auto; /* Center content */
    }
    .blog-post-page h1 {
        margin-bottom: 0.5rem;
        font-size: 2rem;
    }
    .post-meta {
        font-size: 0.9rem;
        color: rgba(var(--primary-color-rgb, 0, 255, 0), 0.7);
        margin-bottom: 2rem;
    }
    .tags {
        margin-left: 0.5rem;
        font-style: italic;
    }
    .post-content {
        line-height: 1.6;
    }
    /* Add styling for rendered markdown elements (h2, p, code, etc.) */
    .post-content :global(h2) {
        font-size: 1.5rem;
        margin-top: 2rem;
        margin-bottom: 1rem;
        border-bottom: 1px solid rgba(var(--primary-color-rgb, 0, 255, 0), 0.5);
        padding-bottom: 0.3rem;
    }
     .post-content :global(code) {
        background-color: rgba(128, 128, 128, 0.2);
        padding: 0.1em 0.3em;
        border-radius: 3px;
        font-size: 0.9em; 
    }
    .post-content :global(pre) {
        background-color: rgba(128, 128, 128, 0.1);
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        border: 1px solid rgba(128, 128, 128, 0.2);
    }
     .post-content :global(pre code) {
        background-color: transparent;
        padding: 0;
        font-size: 0.85em;
    }
    .post-content :global(ul), .post-content :global(ol) {
         padding-left: 2rem;
    }
     .post-content :global(li) {
         margin-bottom: 0.5rem;
    }
    .back-link {
        margin-top: 3rem;
    }
</style> 