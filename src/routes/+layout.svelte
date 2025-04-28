<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount, onDestroy, tick } from 'svelte';
	import { browser } from '$app/environment'; // Import browser check
	import CommandBar from '$lib/components/CommandBar.svelte';
	import NavMenu from '$lib/components/NavMenu.svelte';
	import ThemeCustomizer from '$lib/components/ThemeCustomizer.svelte'; // Import the new component
	import { isCustomizerOpen } from '$lib/stores/uiStore'; // Import the store
	// Import the default export from gsap
	import type { default as gsapType } from 'gsap';
	// Import Action type
	import type { Action } from 'svelte/action';
	// Removed html2canvas import

	// Dynamically import client-side things
	// Use the imported type
	let gsap: typeof gsapType | null = null;
	// Initialize trapFocus with a type compatible with the Action
	let trapFocus: Action<HTMLElement, void> = (_node) => {
		// No-op function for SSR, underscore indicates node is unused here
		return {
			destroy: () => {}
		};
	};

	// Determine if we are on the home page
	$: isHomePage = $page.url.pathname === '/';

	let showGuide = false; // State for modal visibility
	let isAnimating = false; // Prevent double clicks during animation
	let guideButtonEl: HTMLButtonElement | null = null;
	let guideModalEl: HTMLDivElement | null = null;
	let guideOverlayEl: HTMLDivElement | null = null;

	onMount(async () => {
		// Assign the dynamically imported module to the typed variable
		gsap = (await import('gsap')).default;
		// Remove .ts extension from dynamic import
		trapFocus = (await import('$lib/actions/trapFocus')).trapFocus;
		window.addEventListener('keydown', handleKeydown);
	});

	// Removed Bezier and Container helpers

	// --- Simple Fade Animations ---

	async function openGuide() {
		if (!browser || !gsap || isAnimating || !guideButtonEl) return;

		// 1. Set state to render elements
		showGuide = true;
		isAnimating = true;

		// 2. Wait for elements to render and bind
		await tick();

		// Add a requestAnimationFrame to wait for layout calculation
		await new Promise(requestAnimationFrame);

		// 3. Check if elements exist
		if (!guideModalEl || !guideOverlayEl) {
			console.error('Modal or Overlay element not found after tick!');
			showGuide = false; // Reset state
			isAnimating = false;
			return;
		}

		// 4. Fade In Animation
		gsap.killTweensOf([guideOverlayEl, guideModalEl]); // Kill any previous tweens

		gsap.set(guideModalEl, {
			visibility: 'visible',
			opacity: 0,
			// Restore original positioning
			scale: 1,
			xPercent: -50,
			yPercent: -50,
			top: '50%',
			left: '50%',
			transformOrigin: 'center center'
		});
		gsap.set(guideOverlayEl, {
			opacity: 0
		});

		gsap.to(guideOverlayEl, {
			opacity: 1,
			duration: 0.3
		});
		gsap.to(guideModalEl, {
			opacity: 1,
			duration: 0.3,
			onComplete: () => {
				isAnimating = false;
			}
		});
	}

	async function closeGuide() {
		if (
			!browser ||
			!gsap ||
			isAnimating ||
			!showGuide ||
			!guideButtonEl ||
			!guideModalEl ||
			!guideOverlayEl
		)
			return;

		isAnimating = true;

		gsap.killTweensOf([guideOverlayEl, guideModalEl]);

		gsap.to(guideOverlayEl, {
			opacity: 0,
			duration: 0.3
		});
		gsap.to(guideModalEl, {
			opacity: 0,
			duration: 0.3,
			onComplete: () => {
				if (gsap && guideModalEl) {
					gsap.set(guideModalEl, { visibility: 'hidden' }); // Hide after fade
				}
				showGuide = false; // Now update state
				if (guideButtonEl) guideButtonEl.focus();
				isAnimating = false;
			}
		});
	}

	function handleKeydown(event: KeyboardEvent) {
		if (browser && showGuide && event.key === 'Escape') {
			closeGuide();
		}
	}

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('keydown', handleKeydown);
			if (gsap) {
				// Kill tweens if component is destroyed mid-animation
				// Also check if elements exist before killing tweens
				if (guideOverlayEl) {
					gsap.killTweensOf(guideOverlayEl);
				}
				if (guideModalEl) {
					gsap.killTweensOf(guideModalEl);
				}
			}
		}
	});
</script>

<svelte:head>
	<!-- Preconnect to Google Fonts if used -->
</svelte:head>

<main class:home-page={isHomePage}>
	<slot />
</main>

<NavMenu />

<button
	bind:this={guideButtonEl}
	class="guide-button"
	aria-label={showGuide ? 'Close website guide' : 'View website guide'}
	aria-expanded={showGuide}
	on:click={showGuide ? closeGuide : openGuide}
>
	{showGuide ? 'X' : '?'}
</button>

<CommandBar />

<!-- Render Guide Modal -->
{#if showGuide}
	<div
		bind:this={guideOverlayEl}
		class="guide-overlay"
		on:click|self={closeGuide}
		style="opacity: 0;"
		role="button"
		tabindex="-1"
		aria-label="Close guide"
	></div>

	<div
		bind:this={guideModalEl}
		class="guide-modal"
		role="dialog"
		aria-modal="true"
		aria-labelledby="guide-modal-title"
		use:trapFocus
		style="visibility: hidden; opacity: 0;"
	>
		<section class="command-guide">
			<h1 id="guide-modal-title">Website Command Guide</h1>
			<p>Navigate this site using the command prompt below or on the home page:</p>
			<ul>
				<li><code>help</code> - Display list of all available commands.</li>
				<li><code>help &lt;command&gt;</code> - Show description for a specific command.</li>
				<li><code>ls</code> - List available pages (simulates listing directory contents).</li>
				<li>
					<code>cd &lt;page&gt;</code> - Change directory to the specified page (e.g.,
					<code>cd projects</code>).
				</li>
				<li>
					<code>cat &lt;page&gt;</code> - Display basic content overview for a page (e.g.,
					<code>cat about</code>).
				</li>
				<li><code>clear</code> - Clear the terminal output (on the home page).</li>
				<li><code>date</code> - Display the current date and time.</li>
				<li><code>list-fonts</code> - Show available fonts for customization.</li>
				<li><code>set-font &lt;index|name&gt;</code> - Change the website font.</li>
				<li>
					<code>set-theme &lt;#primaryHex&gt; &lt;#secondaryHex&gt;</code> - Set primary text and background
					colors.
				</li>
				<li><code>reset-theme</code> - Reset colors and font to default.</li>
			</ul>
			<p>Use <code>Tab</code> or <code>Right Arrow</code> to accept suggestions.</p>
		</section>
	</div>
{/if}

<!-- Render Theme Customizer Modal -->
{#if $isCustomizerOpen}
	<ThemeCustomizer />
{/if}

<style>
	main {
		padding-bottom: 4rem;
	}
	main.home-page {
		padding-bottom: 0;
	}

	.guide-button {
		position: fixed;
		bottom: 5.5rem;
		right: 1.5rem;
		background-color: rgba(128, 128, 128, 0.5);
		color: var(--background-color);
		border: 1px solid var(--primary-color);
		border-radius: 50%;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
		font-weight: bold;
		text-decoration: none;
		z-index: 1001;
		transition: background-color 0.2s ease;
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}
	.guide-button:hover {
		background-color: rgba(128, 128, 128, 0.8);
	}

	.guide-overlay {
		/* Remove flex properties */
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.7);
		z-index: 1000;
		/* opacity controlled by GSAP */
	}

	.guide-modal {
		position: fixed;
		top: 50%;
		left: 50%;
		/* transform removed, centering via GSAP xPercent/yPercent */
		max-width: 95%; /* Increase for narrow screens */
		max-height: 85vh; /* Default for narrow screens */
		width: auto; /* Allow shrinking below max-width */
		background-color: #000000;
		border: 2px solid var(--primary-color);
		border-radius: 8px;
		padding: 1.5rem 1rem; /* Reduce default horizontal padding */
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
		z-index: 1001;
		overflow-y: auto;
		/* visibility & opacity controlled by GSAP */
	}

	/* Medium screens (e.g., tablets and up) */
	@media (min-width: 768px) {
		.guide-modal {
			max-width: 80%;
			max-height: 80vh;
			width: 700px; /* Set a preferred width, but max-width still applies */
			padding: 2rem; /* Restore larger padding */
		}
	}

	/* Large screens (e.g., desktops) */
	@media (min-width: 1024px) {
		.guide-modal {
			max-width: 70%;
			max-height: 75vh;
			width: 800px; /* Set a preferred width */
			padding: 2rem; /* Restore larger padding */
		}
	}

	.guide-modal h1 {
		border-bottom: 1px solid var(--primary-color);
		padding-bottom: 0.5rem;
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.6rem;
	}
	.guide-modal ul {
		list-style: none;
		padding-left: 1rem;
		margin-bottom: 1rem;
	}
	.guide-modal li::before {
		content: '- ';
		color: var(--primary-color);
		margin-right: 0.5rem;
	}
	.guide-modal code {
		background-color: rgba(128, 128, 128, 0.2);
		padding: 0.1em 0.3em;
		border-radius: 3px;
	}
</style>
