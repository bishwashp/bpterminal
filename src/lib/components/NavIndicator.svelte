<!-- src/lib/components/NavIndicator.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { fly, type FlyParams } from 'svelte/transition';

	let showMenu = false;

	const pages = [
		{ path: '/', name: 'Home' },
		{ path: '/about', name: 'About' },
		{ path: '/projects', name: 'Projects' },
		{ path: '/blog', name: 'Blog' },
		{ path: '/contact', name: 'Contact' }
	];

	function toggleMenu() {
		showMenu = !showMenu;
	}

	function closeMenu() {
		showMenu = false;
	}

	const flyParams: FlyParams = { y: -10, duration: 200 };
</script>

<div class="nav-indicator-container">
	<button class="icon-button" aria-label="Toggle navigation menu" on:click={toggleMenu}> i </button>

	{#if showMenu}
		<nav
			class="nav-menu" 
			transition:fly={flyParams}
			aria-label="Navigation options" 
			on:keydown={(e: KeyboardEvent) => {
				if (e.key === 'Escape') closeMenu();
			}}
			on:focusout={(e: FocusEvent) => {
				if (
					!e.currentTarget ||
					!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)
				) {
					closeMenu();
				}
			}}
			tabindex="-1"
		>
			<!-- Make nav focusable -->
			<ul>
				{#each pages as navItem, i (navItem.path)}
					<li role="menuitem">
						<a
							href={navItem.path}
							aria-current={$page.url.pathname === navItem.path ? 'page' : undefined}
							on:blur={(e: FocusEvent) => {
								if (
									i === pages.length - 1 &&
									!(e.currentTarget as HTMLElement)
										.closest('.nav-menu')
										?.contains(e.relatedTarget as Node)
								) {
									closeMenu();
								}
							}}
						>
							{navItem.name}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}
</div>

<style>
	.nav-indicator-container {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 1001;
	}

	.icon-button {
		/* Reset button styles */
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		font: inherit;
		color: inherit;
		cursor: pointer;
		outline: inherit;

		/* Icon appearance */
		width: 2rem;
		height: 2rem;
		background-color: var(--primary-color);
		color: var(--secondary-color);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: inherit;
		font-weight: bold;
		font-size: 1.2rem;
		user-select: none;
		transition: transform 0.2s ease;
	}
	.icon-button:hover,
	.icon-button:focus {
		transform: scale(1.1);
		outline: 2px solid var(--primary-color);
		outline-offset: 2px;
	}

	nav.nav-menu {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		background-color: rgba(0, 0, 0, 0.95);
		border: 1px solid var(--primary-color);
		padding: 0.5rem 0;
		min-width: 150px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
		outline: none;
	}

	nav.nav-menu ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	nav.nav-menu li a {
		display: block;
		padding: 0.5rem 1rem;
		color: var(--primary-color);
		text-decoration: none;
		white-space: nowrap;
	}

	nav.nav-menu li a:hover,
	nav.nav-menu li a:focus,
	nav.nav-menu li a[aria-current='page'] {
		background-color: var(--primary-color);
		color: var(--secondary-color);
		text-decoration: none;
		outline: none;
	}
</style>
