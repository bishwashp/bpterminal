<script lang="ts">
	import { fly } from 'svelte/transition';

	let isOpen = false;
	let isPersistent = false; // To keep open after click
	let timeoutId: ReturnType<typeof setTimeout>;

	// Dummy pages for now
	const pages = [
		{ path: '/', name: 'Home' },
		{ path: '/about', name: 'About' },
		{ path: '/projects', name: 'Projects' }
        // Add other pages as needed
	];

	function openMenu(persist = false) {
		clearTimeout(timeoutId);
		isOpen = true;
        isPersistent = persist;
	}

	function closeMenu(force = false) {
        if (!isPersistent || force) {
            timeoutId = setTimeout(() => {
                isOpen = false;
                isPersistent = false;
            }, 150); 
        }
	}

	function toggleMenu() {
		if (isOpen && isPersistent) {
			closeMenu(true);
		} else {
			openMenu(true);
		}
	}

    function handleLinkClick() {
        closeMenu(true); 
    }

</script>

<div
	class="nav-container"
	on:mouseenter={() => openMenu()}
	on:mouseleave={() => closeMenu()}
>
    {#if isOpen}
        <!-- List first in markup, order:-1 visually places it left -->
		<ul class="nav-list" transition:fly={{ x: 50, duration: 200 }}>
			{#each pages as page}
				<li>
                    <a href={page.path} on:click={handleLinkClick}>{page.name}</a>
                </li>
			{/each}
		</ul>
	{/if}

	<button
		class="nav-button"
		aria-label="Toggle Navigation"
		aria-expanded={isOpen}
		on:click={toggleMenu}
	>
		i
	</button>
</div>

<style>
	.nav-container {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 1000;
        display: flex; /* Restore flexbox */
        align-items: center; /* Restore vertical centering */
        justify-content: flex-end; /* Align items to the right edge */
        gap: 1rem; /* Restore gap */
        /* Remove relative positioning and fixed size */
        /* position: relative; */
        /* width: 2.2rem; */
        /* height: 2.2rem; */
	}

	.nav-button {
        /* Restore explicit size */
		background-color: var(--primary-color);
		color: var(--secondary-color);
		border: none;
		border-radius: 50%;
		width: 2.2rem;
		height: 2.2rem;
		font-size: 1rem;
        font-weight: bold;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        outline: 2px solid transparent; 
        outline-offset: 0px; 
		transition: background-color 0.2s ease, outline-color 0.2s ease, outline-offset 0.2s ease; 
	}

    .nav-button:hover {
        filter: brightness(0.8);
        outline-color: var(--primary-color);
        outline-offset: 3px;
	}
    .nav-button:focus-visible {
        outline-color: var(--primary-color);
        outline-offset: 3px;
        filter: brightness(0.8);
    }

	.nav-list {
		/* Remove absolute positioning */
        /* position: absolute; */
        /* top: 50%; */
        /* transform: translateY(-50%); */
        /* right: calc(100% + 0.75rem); */
		background-color: var(--secondary-color);
		border: 1px solid var(--primary-color);
		border-radius: 4px;
		list-style: none;
		padding: 0.6rem 0; 
		margin: 0;
        white-space: nowrap; 
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        order: -1; /* Restore flex order */
	}

    .nav-list li {
        display: inline-block; 
        margin-right: 0.5rem; 
        position: relative; 
    }

    .nav-list li:not(:last-child)::after {
        content: '|';
        color: var(--primary-color);
        position: absolute;
        right: -0.35rem; 
        top: 50%;
        transform: translateY(-50%);
        opacity: 0.5; 
    }

	.nav-list li a {
		padding: 0 0.8rem; 
		color: var(--primary-color);
		text-decoration: none;
		transition: background-color 0.2s ease, color 0.2s ease;
        text-decoration: none; 
        position: relative; 
        overflow: visible; 
	}

    .nav-list li a::after {
        content: '';
        position: absolute;
        bottom: -3px; 
        left: 0;
        width: 100%;
        height: 2px;
        background-color: var(--primary-color);
        transform: scaleX(0); 
        transform-origin: left; 
        transition: transform 0.3s ease-out;
    }

	.nav-list li a:hover {
		color: var(--primary-color); 
        filter: brightness(1.2); 
	}

    .nav-list li a:hover::after {
        transform: scaleX(1); 
    }

</style> 