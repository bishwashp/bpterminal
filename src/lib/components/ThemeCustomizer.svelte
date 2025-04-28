<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { isCustomizerOpen } from '$lib/stores/uiStore';
	import { theme, availableFonts } from '$lib/stores/themeStore';
	import { trapFocus } from '$lib/actions/trapFocus';
	import { browser } from '$app/environment';

	// Remove current* variables - no longer needed
	// let currentFont = $theme.fontFamily;
	// let currentPrimary = $theme.primaryColor;
	// let currentSecondary = $theme.secondaryColor;

	// Initialize selections directly from store values
	let selectedFont = $theme.fontFamily;
	let selectedPrimary = $theme.primaryColor;
	let selectedSecondary = $theme.secondaryColor;

	let modalElement: HTMLDivElement;
	let overlayElement: HTMLDivElement;
	let firstFocusableElement: HTMLElement | null = null; // For trapFocus

	const primaryColors = [
		{ name: 'Default Green', value: '#32CD32' },
		{ name: 'Amber', value: '#FFBF00' },
		{ name: 'Cyan', value: '#00FFFF' },
		{ name: 'White', value: '#FFFFFF' },
		{ name: 'Light Gray', value: '#CCCCCC' },
		{ name: 'Pink', value: '#FF69B4' }
	];
	const secondaryColors = [
		{ name: 'Default Black', value: '#000000' },
		{ name: 'Dark Gray', value: '#1A1A1A' },
		{ name: 'Navy', value: '#000080' },
		{ name: 'Very Dark Blue', value: '#050a14' }
	];

	// Helper to get clean font name
	function getCleanFontName(fontFamily: string): string {
		return fontFamily.split(',')[0].replace(/['"]/g, '');
	}

	function close() {
		isCustomizerOpen.set(false);
	}

	function applyChanges() {
		theme.setFont(selectedFont);
		theme.setColors(selectedPrimary, selectedSecondary);
		close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}

	onMount(() => {
		// Initialize selections - MOVED to variable declarations above
		// selectedFont = currentFont;
		// selectedPrimary = currentPrimary;
		// selectedSecondary = currentSecondary;

		// Focus first element
		setTimeout(() => {
			if (modalElement) {
				firstFocusableElement = modalElement.querySelector('select, button') as HTMLElement;
				firstFocusableElement?.focus();
			}
		}, 50);

		// Add escape listener
		if (browser) { // Add browser check for safety
			window.addEventListener('keydown', handleKeydown);
		}

		// Cleanup
		return () => {
			if (browser) { // Add browser check for safety
				window.removeEventListener('keydown', handleKeydown);
			}
		};
	});
</script>

<!-- Close when clicking overlay itself -->
<div
	bind:this={overlayElement}
	class="customizer-overlay"
	on:click|self={close}
	role="button"
	tabindex="-1"
	aria-label="Close customization panel"
>
	<div
		bind:this={modalElement}
		class="customizer-modal"
		role="dialog"
		aria-modal="true"
		aria-labelledby="customizer-title"
		use:trapFocus
	>
		<h1 id="customizer-title">Customize Theme</h1>

		<div class="form-group">
			<label for="font-select">Font:</label>
			<select id="font-select" bind:value={selectedFont}>
				{#each availableFonts as font}
					<option value={font}>{getCleanFontName(font)}</option>
				{/each}
			</select>
		</div>

		<div class="form-group">
			<label for="primary-color-select">Primary Color (Text):</label>
			<div class="select-with-preview">
				<select id="primary-color-select" bind:value={selectedPrimary}>
					<option value={$theme.primaryColor}>Current ({$theme.primaryColor})</option>
					{#each primaryColors as color (color.value)}
						{#if color.value !== $theme.primaryColor}
							<option value={color.value}>{color.name}</option>
						{/if}
					{/each}
				</select>
				<span class="color-preview" style="background-color: {selectedPrimary};"></span>
			</div>
		</div>

		<div class="form-group">
			<label for="secondary-color-select">Secondary Color (Background):</label>
			<div class="select-with-preview">
				<select id="secondary-color-select" bind:value={selectedSecondary}>
					<option value={$theme.secondaryColor}>Current ({$theme.secondaryColor})</option>
					{#each secondaryColors as color (color.value)}
						{#if color.value !== $theme.secondaryColor}
							<option value={color.value}>{color.name}</option>
						{/if}
					{/each}
				</select>
				<span class="color-preview" style="background-color: {selectedSecondary};"></span>
			</div>
		</div>

		<div class="button-group">
			<button on:click={applyChanges} class="apply-btn">Apply</button>
			<button on:click={close} class="close-btn">Close</button>
		</div>
	</div>
</div>

<style>
	.customizer-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.7);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.customizer-modal {
		position: relative; /* Since overlay is handling positioning */
		max-width: 95%; /* Default for narrow screens */
		max-height: 90vh; /* Allow slightly more height */
		width: 500px; /* Default preferred width */
		background-color: var(--secondary-color, #000000);
		border: 2px solid var(--primary-color, #32cd32);
		color: var(--primary-color, #32cd32);
		border-radius: 8px;
		padding: 1.5rem 1rem; /* Reduced horizontal padding */
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
		z-index: 1001;
		overflow-y: auto;
		font-family: inherit; /* Use terminal font */
	}

	.customizer-modal h1 {
		border-bottom: 1px solid var(--primary-color);
		padding-bottom: 0.5rem;
		margin-top: 0;
		margin-bottom: 1.5rem;
		font-size: 1.4rem;
		text-align: center;
	}

	.form-group {
		margin-bottom: 1.2rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
		grid-column: 1 / -1; /* Make label span full width in grid */
	}

	.form-group select {
		width: 100%;
		padding: 0.5rem;
		background-color: rgba(128, 128, 128, 0.2);
		border: 1px solid var(--primary-color);
		color: var(--primary-color);
		border-radius: 4px;
		font-family: inherit;
		font-size: 0.9rem;
		cursor: pointer;
		flex-grow: 1; /* Allow select to take available space */
		-webkit-appearance: none; /* Remove default appearance */
		appearance: none;
		background-image: linear-gradient(45deg, transparent 50%, var(--primary-color) 50%), linear-gradient(135deg, var(--primary-color) 50%, transparent 50%);
		background-position: calc(100% - 15px) center, calc(100% - 10px) center;
		background-size: 5px 5px, 5px 5px;
		background-repeat: no-repeat;
		padding-right: 2rem; /* Space for custom arrow */
	}

	.form-group select:focus {
		outline: 1px solid var(--primary-color);
		/* Optional focus glow - requires primary-color-rgb to be defined */
		/* box-shadow: 0 0 5px rgba(var(--primary-color-rgb, 50, 205, 50), 0.5); */
	}

	.button-group {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(128, 128, 128, 0.3);
	}

	.button-group button {
		padding: 0.6rem 1.2rem;
		border: 1px solid var(--primary-color);
		background-color: transparent;
		color: var(--primary-color);
		border-radius: 4px;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.9rem;
		transition: background-color 0.2s ease, color 0.2s ease;
	}

	.button-group button.apply-btn:hover {
		background-color: var(--primary-color);
		color: var(--secondary-color);
	}

	.button-group button.close-btn {
		border-color: rgba(128, 128, 128, 0.7);
		color: rgba(128, 128, 128, 0.9);
	}

	.button-group button.close-btn:hover {
		background-color: rgba(128, 128, 128, 0.5);
		color: #ffffff;
	}

	/* Responsive Adjustments */
	@media (min-width: 600px) {
		.customizer-modal {
			max-width: 90%;
			width: 500px; /* Keep preferred width */
			padding: 2rem; /* Restore larger padding */
		}
	}

	@media (min-width: 768px) {
		.customizer-modal {
			width: 600px; /* Slightly larger width */
		}
		.form-group {
			display: grid;
			grid-template-columns: 1fr 2fr; /* Label | Select */
			align-items: center;
			gap: 1rem;
			margin-bottom: 1rem;
		}
		.form-group label {
			grid-column: auto; /* Revert for grid layout */
			margin-bottom: 0; /* Reset margin */
			text-align: right;
		}
	}

	.select-with-preview {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.color-preview {
		display: inline-block;
		width: 1.5rem;
		height: 1.5rem;
		border: 1px solid var(--primary-color);
		border-radius: 3px;
		flex-shrink: 0;
	}
</style> 