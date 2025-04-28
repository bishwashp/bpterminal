<!-- src/lib/components/CommandBar.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import {
		executeCommand,
		getAvailableCommands,
		getPathCompletions,
		availableFonts
	} from '$lib/commandHandler';
	import { fly } from 'svelte/transition';

	let commandInput = '';
	let commandHistory: string[] = [];
	let historyIndex = -1;
	let showOutput = false;
	let outputText = '';
	let outputType: 'output' | 'error' = 'output';
	let inputElement: HTMLInputElement;
	let commandBarContainerElement: HTMLDivElement;
	let suggestion = '';

	// --- Reactive Statement for Page Navigation ---
	// This runs whenever page.url.pathname changes
	$: if ($page.url.pathname && showOutput) {
		closeOutput();
	}

	async function handleCommand() {
		const currentCommand = commandInput;
		if (!currentCommand.trim()) return;

		// Add to history
		if (currentCommand !== commandHistory[commandHistory.length - 1]) {
			commandHistory = [...commandHistory, currentCommand];
		}
		historyIndex = commandHistory.length;
		commandInput = ''; // Clear input

		// Execute command
		const result = await executeCommand(currentCommand, $page.url.pathname);
		const resultString = Array.isArray(result) ? result.join('\n') : String(result);

		if (resultString && resultString !== '__CLEAR__') {
			// Don't show output for clear or void results
			outputType =
				resultString.toLowerCase().startsWith('error:') ||
				resultString.toLowerCase().includes('not found') ||
				resultString.toLowerCase().includes('cannot access') ||
				resultString.toLowerCase().includes('no such file')
					? 'error'
					: 'output';
			outputText = resultString;
			showOutput = true;
		} else {
			showOutput = false; // Ensure output is hidden if command has no output
		}
		suggestion = ''; // Clear suggestion after command
	}

	function closeOutput() {
		showOutput = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		// Dismiss output on any relevant key press in the input
		if (showOutput && event.key !== 'Shift' && event.key !== 'Control' && event.key !== 'Alt' && event.key !== 'Meta') {
			closeOutput();
		}

		// Suggestion Acceptance (Tab or ArrowRight at end of input)
		if (
			(event.key === 'Tab' ||
				(event.key === 'ArrowRight' &&
					inputElement &&
					inputElement.selectionStart === commandInput.length)) &&
			suggestion
		) {
			event.preventDefault();
			commandInput = suggestion; // Accept the suggestion
			suggestion = ''; // Clear suggestion
			return; // Don't process other keys or update suggestion yet
		}

		// Handle other keys
		if (event.key === 'Enter') {
			handleCommand();
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (historyIndex > 0) {
				historyIndex--;
				commandInput = commandHistory[historyIndex];
				suggestion = '';
			}
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (historyIndex < commandHistory.length - 1) {
				historyIndex++;
				commandInput = commandHistory[historyIndex];
			} else if (historyIndex === commandHistory.length - 1) {
				historyIndex++;
				commandInput = '';
			}
			suggestion = '';
		}
		// Update suggestion after key press
		setTimeout(updateSuggestion, 0);
	}

	function updateSuggestion() {
		const currentInput = commandInput.trimStart();
		if (!currentInput || commandInput.endsWith(' ')) {
			suggestion = '';
			return;
		}

		const parts = currentInput.split(' ');
		const isTypingCommand = parts.length === 1;
		const commandName = parts[0];
		const lastPart = parts[parts.length - 1];

		let potentialCompletions: string[] = [];

		if (isTypingCommand) {
			const allCommands = getAvailableCommands();
			potentialCompletions = allCommands.filter((cmd) => cmd.startsWith(lastPart));
		} else {
			let candidates: string[] = [];
			if (commandName === 'cd' || commandName === 'ls' || commandName === 'cat') {
				candidates = getPathCompletions();
			} else if (commandName === 'set-font') {
				candidates = availableFonts.map((f: string) => f.split(',')[0].replace(/['"]/g, ''));
			}
			potentialCompletions = candidates.filter((p) => p.startsWith(lastPart));
		}

		const firstSuggestion = potentialCompletions.find(
			(comp) => comp.startsWith(lastPart) && comp !== lastPart
		);

		if (firstSuggestion) {
			parts[parts.length - 1] = firstSuggestion;
			suggestion = parts.join(' ');
		} else {
			suggestion = '';
		}
	}

	// --- Dismissal Logic ---
	function handleOutsideClick(event: MouseEvent) {
		if (showOutput && commandBarContainerElement && !commandBarContainerElement.contains(event.target as Node)) {
			closeOutput();
		}
	}

	onMount(() => {
		if (browser) {
			window.addEventListener('click', handleOutsideClick);
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('click', handleOutsideClick);
		}
	});
</script>

<div class="command-bar-container" bind:this={commandBarContainerElement}>
	{#if showOutput}
		<div
			class="command-output"
			class:error={outputType === 'error'}
			transition:fly={{ y: 10, duration: 300 }}
		>
			<button class="close-output-btn" on:click={closeOutput} aria-label="Close output">&times;</button>
			<pre>{outputText}</pre>
		</div>
	{/if}
	<div class="command-input-area">
		<span>{$page.url.pathname}&nbsp;&gt;&nbsp;</span>
		<div class="input-wrapper">
			<input
				bind:this={inputElement}
				type="text"
				bind:value={commandInput}
				aria-label="Command input bar"
				on:keydown={handleKeyDown}
				on:input={updateSuggestion}
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
				spellcheck="false"
			/>
			<!-- Suggestion Display -->
			{#if suggestion && suggestion.startsWith(commandInput) && suggestion.length > commandInput.length}
				<span class="suggestion"
					>{commandInput}<span class="suggestion-suffix"
						>{suggestion.slice(commandInput.length)}</span
					></span
				>
			{/if}
		</div>
	</div>
</div>

<style>
	.command-bar-container {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background-color: var(--secondary-color);
		border-top: 1px solid var(--primary-color);
		z-index: 1000;
		font-size: 0.9rem;
	}

	.command-output {
		position: absolute;
		bottom: 100%; /* Position above the input bar */
		left: 0;
		width: 100%;
		color: var(--primary-color);
		padding: 0.5rem 1rem;
		border-top: 1px solid var(--primary-color);
		max-height: 150px; /* Limit height */
		overflow-y: auto;
		position: relative; /* Needed for absolute positioning of button */
	}
	.command-output.error {
		color: var(--error-color);
		border-top-color: var(--error-color);
	}
	.command-output pre {
		margin: 0;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.command-input-area {
		display: flex;
		align-items: center;
		padding: 0.5rem 1rem; /* Padding inside the bar */
	}

	.command-input-area span {
		margin-right: 0.5rem;
		white-space: nowrap;
	}

	.input-wrapper {
		position: relative;
		flex-grow: 1;
		display: flex;
		align-items: center;
	}

	.command-input-area input {
		position: relative;
		z-index: 1;
		background-color: transparent;
		flex-grow: 1;
		border: none;
		color: inherit;
		font-family: inherit;
		font-size: inherit;
		outline: none;
		caret-color: var(--caret-color);
		caret-shape: block;
		/* Apply blink animation when focused */
		animation: blink 1s step-end infinite;
	}

	/* Ensure animation stops when not focused */
	.command-input-area input:not(:focus) {
		animation: none;
	}

	.suggestion {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		display: flex;
		align-items: center;
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
		color: transparent;
		pointer-events: none;
		z-index: 0;
		white-space: pre;
	}

	.suggestion-suffix {
		color: rgba(128, 128, 128, 0.7);
	}

	.close-output-btn {
		position: absolute;
		top: 0.25rem;
		right: 0.5rem;
		background: none;
		border: none;
		color: inherit;
		opacity: 0.7;
		font-size: 1.2rem;
		line-height: 1;
		padding: 0.1rem 0.25rem;
		cursor: pointer;
		z-index: 1;
	}

	.close-output-btn:hover {
		opacity: 1;
	}
</style>
