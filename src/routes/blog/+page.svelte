<!-- src/routes/blog/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';
    import { page } from '$app/stores'; // Import page store for query params
    import { onMount } from 'svelte'; // Import onMount
    
    // Get posts and tags data from the load function
    export let data: PageData;
    $: allPosts = data.posts || [];
    $: allTags = data.allTags || [];

    // State for filtering
    let selectedTag: string | null = null;
    $: filteredPosts = selectedTag 
        ? allPosts.filter(post => post.tags.includes(selectedTag!)) 
        : allPosts;

    // Read initial tag from URL query param on mount (client-side)
    onMount(() => {
        const urlParams = new URLSearchParams($page.url.search);
        const tagFromUrl = urlParams.get('tag');
        if (tagFromUrl && allTags.includes(tagFromUrl)) {
            selectedTag = tagFromUrl;
        }
    });

    function selectTag(tag: string | null) {
        selectedTag = tag;
        // Update URL query param (optional, good for sharing/bookmarking)
        const url = new URL($page.url);
        if (tag) {
            url.searchParams.set('tag', tag);
        } else {
            url.searchParams.delete('tag');
        }
        // Use replaceState to avoid adding to browser history for simple filtering
        history.replaceState(history.state, '', url);
    }

</script>

<div class="page-content blog-page">
    <h1>Blog</h1>
    <p>Recent articles and thoughts. Use <code>cat blog</code> for a quick overview.</p>

    <!-- Tag Filter Area -->
    {#if allTags.length > 0}
        <div class="tag-filter">
            <span>Filter by tag:</span>
            {#each allTags as tag}
                <button 
                    class="tag-button" 
                    class:active={selectedTag === tag}
                    on:click={() => selectTag(tag)}
                >
                    {tag}
                </button>
            {/each}
            {#if selectedTag}
                <button class="tag-button clear" on:click={() => selectTag(null)}>
                    Clear Filter (x)
                </button>
            {/if}
        </div>
    {/if}

    <!-- Post List Area -->
    <div class="post-list">
        {#if filteredPosts.length > 0}
            {#each filteredPosts as post (post.slug)}
                <article>
                    <a href="/blog/{post.slug}" class="post-title">
                        <h2>{post.title}</h2>
                    </a>
                    <p class="post-meta">Published on: {post.date}</p>
                    <p class="post-excerpt">{post.excerpt}</p> 
                    {#if post.tags.length > 0}
                         <p class="post-tags">Tags: {post.tags.join(', ')}</p>
                    {/if}
                </article>
            {/each}
        {:else}
             <p>No posts found{#if selectedTag} with the tag "{selectedTag}"{/if}.</p>
        {/if}
    </div>

</div>

<style>
    .page-content {
        padding: 2rem;
    }
    .blog-page code {
        background-color: rgba(128, 128, 128, 0.2);
        padding: 0.1em 0.3em;
        border-radius: 3px;
    }

    /* Tag Filter Styles */
    .tag-filter {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px dashed rgba(var(--primary-color-rgb, 0, 255, 0), 0.5);
    }
    .tag-filter span {
        margin-right: 0.5rem;
    }
    .tag-button {
        background: none;
        border: 1px solid var(--primary-color);
        color: var(--primary-color);
        padding: 0.25rem 0.75rem;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem; /* Allow wrapping */
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.85rem;
        transition: background-color 0.2s ease, color 0.2s ease;
    }
    .tag-button:hover,
    .tag-button.active {
        background-color: var(--primary-color);
        color: var(--secondary-color);
    }
    .tag-button.clear {
        border-color: #ccc; /* Use a neutral color for clear */
        color: #ccc;
    }
    .tag-button.clear:hover {
         background-color: #ccc;
        color: #000;
    }

    /* Post List Styles */
    .post-list article {
        margin-bottom: 2rem;
        padding-left: 1rem;
        border-left: 2px solid var(--primary-color);
    }
    .post-list h2 {
        margin-bottom: 0.25rem;
        font-size: 1.4rem;
    }
    .post-title {
        color: var(--primary-color);
        text-decoration: none;
    }
    .post-title:hover {
        text-decoration: underline;
    }
     .post-meta {
        font-size: 0.85rem;
        color: rgba(var(--primary-color-rgb, 0, 255, 0), 0.7);
        margin-bottom: 0.5rem;
    }
     .post-excerpt {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
    }
    .post-tags {
        font-size: 0.8rem;
        font-style: italic;
        color: rgba(var(--primary-color-rgb, 0, 255, 0), 0.6);
    }

    /* Helper to extract RGB from hex for rgba() - REMOVED, handled by theme store */
    /*
    :root {
        --primary-color-rgb: 0, 255, 0;
    }
    */
</style> 