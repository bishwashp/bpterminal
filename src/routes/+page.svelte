<script lang="ts">
	import { onMount } from 'svelte';
	import {
		executeCommand,
		getAvailableCommands,
		getPathCompletions,
		availableFonts
	} from '../lib/commandHandler';
	import { page } from '$app/stores'; // To get current path
	import { typewriter } from '$lib/actions/typewriter'; // Import the action

	// Structure for output lines, adding ID for keying
	interface OutputLine {
		id: number;
		type: 'input' | 'output' | 'error';
		text: string;
		useTypewriter?: boolean; // Flag to enable typewriter effect
		typewriterDelay?: number; // Delay for this specific line
	}

	let lineIdCounter = 0;
	let output: OutputLine[] = [];
	let commandInput = '';
	let commandHistory: string[] = [];
	let historyIndex = -1;
	let inputElement: HTMLInputElement;
	let canType = true; // Control when user can type
	let suggestion = ''; // State for predictive suggestion

	onMount(() => {
		// Initial welcome message setup
		const welcomeMessages = [
			{ text: 'Welcome to bpterminal v1.2.0', delay: 0 }, // Finishes ~840ms
			{ text: "Type 'help' or click \"?\" button on the bottom right to see available commands.", delay: 1000 }, // Finishes ~3550ms
			{ text: ' ', delay: 3700 } // Finishes ~3730ms
		];

		output = welcomeMessages.map((msg) => ({
			id: lineIdCounter++,
			type: 'output',
			text: msg.text,
			useTypewriter: true,
			typewriterDelay: msg.delay
		}));

		// Initially disable input until welcome message finishes typing
		canType = false;
		inputElement?.setAttribute('disabled', 'true');

		// Focus the input after welcome message animation
		setTimeout(() => {
			if (inputElement) {
				setTimeout(() => { // Delay focus slightly
					inputElement.focus();
					inputElement.removeAttribute('disabled');
				}, 0); // Execute after current stack clears
			} else {
				// Error log removed
			}
			canType = true;
		}, 3800); // Adjusted timeout
	});

	async function handleCommand() {
		if (!canType) return; // Prevent input during initial animation
		const currentCommand = commandInput;
		if (!currentCommand.trim()) return; // Ignore empty commands

		// Add command to output and history - ensure NO typewriter effect
		output = [...output, { id: lineIdCounter++, type: 'input', text: `> ${currentCommand}` }]; // No useTypewriter flag
		if (currentCommand !== commandHistory[commandHistory.length - 1]) {
			commandHistory = [...commandHistory, currentCommand];
		}
		historyIndex = commandHistory.length; // Reset history index
		commandInput = ''; // Clear input

		// Execute command
		const result = await executeCommand(currentCommand, $page.url.pathname);
		const resultString = Array.isArray(result) ? result.join('\n') : String(result);

		// Handle clear command separately
		if (resultString === '__CLEAR__') {
			output = [{ id: lineIdCounter++, type: 'output', text: ' ' }]; // Start fresh, maybe a blank line
		} else if (resultString) {
			// Add result to output, splitting lines
			const lines = resultString.split('\n');
			const resultType =
				resultString.toLowerCase().startsWith('error:') ||
				resultString.toLowerCase().includes('not found') ||
				resultString.toLowerCase().includes('cannot access') ||
				resultString.toLowerCase().includes('no such file')
					? 'error'
					: ('output' as 'error' | 'output'); // Explicitly cast type
			// Ensure new output lines do NOT use typewriter
			const newOutputLines = lines.map((line) => ({ id: lineIdCounter++, type: resultType, text: line })); // No useTypewriter flag
			output = [
				...output,
				...newOutputLines
			];
		}

		// Scroll to bottom (defer needed to wait for DOM update)
		setTimeout(() => {
			const container = document.querySelector('.output-area');
			container?.scrollTo(0, container.scrollHeight);
		}, 0);

		// Ensure suggestion is cleared after command execution
		suggestion = '';
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!canType) return;

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
			handleCommand(); // suggestion cleared within handleCommand
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (historyIndex > 0) {
				historyIndex--;
				commandInput = commandHistory[historyIndex];
				suggestion = ''; // Clear suggestion when using history
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
			suggestion = ''; // Clear suggestion when using history
		}
		// Any other key press might change the input, so update suggestion
		// Use setTimeout to allow input value to update before calculating suggestion
		setTimeout(updateSuggestion, 0);
	}

	function updateSuggestion() {
		const currentInput = commandInput.trimStart();
		if (!currentInput || commandInput.endsWith(' ')) {
			// Don't suggest if empty or ending with space
			suggestion = '';
			return;
		}

		const parts = currentInput.split(' ');
		const isTypingCommand = parts.length === 1;
		const commandName = parts[0];
		const lastPart = parts[parts.length - 1];

		let potentialCompletions: string[] = [];

		if (isTypingCommand) {
			// Suggesting commands
			const allCommands = getAvailableCommands();
			potentialCompletions = allCommands.filter((cmd) => cmd.startsWith(lastPart));
		} else {
			// Suggesting arguments (paths for cd/ls/cat, fonts for set-font)
			let candidates: string[] = [];
			if (commandName === 'cd' || commandName === 'ls' || commandName === 'cat') {
				candidates = getPathCompletions(); // Use path helper
			} else if (commandName === 'set-font') {
				candidates = availableFonts.map((f: string) => f.split(',')[0].replace(/['\"]/g, '')); // Use clean font names
			} // Add more commands needing argument suggestions here

			potentialCompletions = candidates.filter((p) => p.startsWith(lastPart));
		}

		// Find the first completion that is different from the current input part
		const firstSuggestion = potentialCompletions.find(
			(comp) => comp.startsWith(lastPart) && comp !== lastPart
		);

		if (firstSuggestion) {
			// Construct the full suggested command line
			parts[parts.length - 1] = firstSuggestion;
			suggestion = parts.join(' ');
		} else {
			suggestion = ''; // No suggestion found
		}
	}
</script>

<div class="terminal-container">
	<div class="output-area">
		{#each output as lineItem (lineItem.id)}
			{#if lineItem.useTypewriter}
				<!-- P element with typewriter effect -->
				<p
					id={`line-${lineItem.id}`}
					class:error={lineItem.type === 'error'}
					class:input-line={lineItem.type === 'input'}
					use:typewriter={{
						text: lineItem.text,
						speed: 30, // Faster speed
						delay: lineItem.typewriterDelay ?? 0
					}}
				>
					&nbsp;
				</p>
				<!-- Placeholder for typewriter -->
			{:else}
				<!-- P element for static text (no typewriter) -->
				<p
					id={`line-${lineItem.id}`}
					class:error={lineItem.type === 'error'}
					class:input-line={lineItem.type === 'input'}
				>
					{lineItem.text || '&nbsp;'}
				</p>
				<!-- Display text directly, use nbsp if empty -->
			{/if}
		{/each}
	</div>
	<div class="input-area">
		<span>{$page.url.pathname}&nbsp;&gt;&nbsp;</span>
		<div class="input-wrapper">
			<input
				bind:this={inputElement}
				type="text"
				bind:value={commandInput}
				aria-label="Command input"
				on:keydown={(e) => { handleKeyDown(e); }}
				on:input={updateSuggestion}
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
				spellcheck="false"
				disabled={!canType}
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
	.terminal-container {
		display: flex;
		flex-direction: column;
		height: 100vh; /* Full viewport height */
		padding: 1rem;
		cursor: text; /* Indicate text input area */
	}

	.output-area {
		flex-grow: 1;
		overflow-y: auto; /* Allow scrolling for output */
		margin-bottom: 1rem;
		font-size: 0.95rem; /* Slightly smaller for output */
		line-height: 1.3;
	}

	.output-area p {
		margin: 0;
		white-space: pre-wrap; /* Preserve whitespace */
		word-break: break-word; /* Better word breaking */
		min-height: 1.3em; /* Prevent empty lines from collapsing */
		/* Ensure visibility for typewriter effect */
		visibility: visible;
		opacity: 1;
	}

	.output-area p.error {
		color: var(--error-color); /* Use error color variable */
	}

	.input-area {
		display: flex;
		align-items: center;
		border-top: 1px solid var(--primary-color); /* Add separator line */
		padding-top: 0.5rem; /* Add some padding above the input */
		margin-top: 0.5rem; /* Add some space between output and input area */
	}

	.input-area span {
		margin-right: 0.5rem;
		white-space: nowrap; /* Prevent prompt from wrapping */
	}

	.input-wrapper {
		position: relative;
		flex-grow: 1;
		display: flex; /* Aligns input and suggestion container */
		align-items: center; /* Vertical alignment */
	}

	.input-area input {
		flex-grow: 1;
		background-color: transparent;
		border: none;
		color: inherit; /* Inherit color from body */
		font-family: inherit; /* Inherit from body (uses var(--font-family)) */
		font-size: 1rem;
		outline: none;
		caret-color: var(--caret-color); /* Use caret color variable */
		position: relative; /* Needed for z-index */
		z-index: 1; /* Ensure input text is above suggestion */
	}

	.suggestion {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%; /* Match input height */
		display: flex; /* Align items */
		align-items: center; /* Vertical alignment */
		font-family: inherit;
		font-size: inherit; /* Match input font size */
		line-height: inherit; /* Match input line-height */
		color: transparent; /* Make base suggestion text invisible */
		pointer-events: none; /* Prevent interaction */
		z-index: 0; /* Behind the actual input text */
		white-space: pre; /* Match input spacing behavior */
	}

	.suggestion-suffix {
		color: rgba(128, 128, 128, 0.7); /* Grayed out suggestion suffix */
	}

	/* Style the input caret */
	.input-area input {
		caret-shape: block;
		/* Apply blink animation when focused */
		animation: blink 1s step-end infinite;
	}

	/* Ensure animation stops when not focused */
	.input-area input:not(:focus) {
		animation: none;
	}
</style>
