/**
 * Svelte Action for a typewriter effect.
 *
 * @param node The HTML element to apply the effect to.
 * @param params Configuration object.
 * @param params.text The text to type out.
 * @param params.speed Typing speed in milliseconds per character (default: 50).
 * @param params.delay Initial delay before typing starts (default: 0).
 */
export function typewriter(
	node: HTMLElement,
	params: { text: string; speed?: number; delay?: number }
) {
	const { text, speed = 50, delay = 0 } = params;
	const originalText = text; // Store the initial text
	let i = 0;
	let intervalId: ReturnType<typeof setInterval>;

	function typeCharacter() {
		if (i < text.length) {
			node.textContent += text.charAt(i);
			i++;
		} else {
			clearInterval(intervalId);
			// Optionally dispatch an event when done
			node.dispatchEvent(new CustomEvent('typewriterComplete'));
		}
	}

	// Clear existing content
	node.textContent = '';

	// Start typing after delay
	setTimeout(() => {
		intervalId = setInterval(typeCharacter, speed);
	}, delay);

	return {
		// Optional: Update method if params change dynamically (not strictly needed here)
		update(newParams: { text: string; speed?: number; delay?: number }) {
			const { text: newText, speed: newSpeed = 50, delay: newDelay = 0 } = newParams;

			// Only restart if the text content itself has changed
			if (newText !== originalText) {
				clearInterval(intervalId);
				i = 0;
				node.textContent = ''; // Clear before restarting
				// Update originalText if we intend to allow dynamic text changes later
				// originalText = newText; // Uncomment if needed

				setTimeout(() => {
					intervalId = setInterval(() => {
						if (i < newText.length) {
							node.textContent += newText.charAt(i);
							i++;
						} else {
							clearInterval(intervalId);
							node.dispatchEvent(new CustomEvent('typewriterComplete'));
						}
					}, newSpeed); // Use newSpeed
				}, newDelay); // Use newDelay
			} else {
				// Optional: If only speed/delay changed, could update them without restarting
				// For now, we do nothing if text is the same, preserving the original animation.
			}
		},

		destroy() {
			// Cleanup interval on component destroy
			clearInterval(intervalId);
		}
	};
}
