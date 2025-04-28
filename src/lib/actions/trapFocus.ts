import type { Action } from 'svelte/action';

/**
 * Traps focus within the given node.
 * Listens for Tab and Shift+Tab key presses to cycle focus.
 * @param {HTMLElement} node The element to trap focus within.
 */
export const trapFocus: Action<HTMLElement, void> = (node) => {
	// Type casting might be needed depending on TS config, but HTMLElement is usually safe
	const previousActiveElement = document.activeElement as HTMLElement | null;

	const focusableElementsString =
		'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';

	let focusableElements: HTMLElement[] = [];
	let firstFocusableElement: HTMLElement | undefined;
	let lastFocusableElement: HTMLElement | undefined;

	function updateFocusableElements() {
		// QuerySelectorAll returns NodeListOf<Element>, need to cast or filter
		focusableElements = Array.from(
			node.querySelectorAll<HTMLElement>(focusableElementsString)
		);
		firstFocusableElement = focusableElements[0];
		lastFocusableElement = focusableElements[focusableElements.length - 1];
		// Automatically focus the first element when the action is mounted
		// Check type safely
		if (firstFocusableElement) {
			firstFocusableElement.focus();
		}
	}

	updateFocusableElements(); // Initial call

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key !== 'Tab') return;

		// Recalculate in case elements changed dynamically
		updateFocusableElements();
		// Added null/undefined check
		if (!focusableElements.length || !firstFocusableElement || !lastFocusableElement) return;

		if (e.shiftKey) {
			// Shift + Tab
			// Type casting for document.activeElement might be needed if strict DOM types are enforced
			if (document.activeElement === firstFocusableElement) {
				lastFocusableElement.focus();
				e.preventDefault();
			}
		} else {
			// Tab
			if (document.activeElement === lastFocusableElement) {
				firstFocusableElement.focus();
				e.preventDefault();
			}
		}
	};

	node.addEventListener('keydown', handleKeyDown);

	return {
		destroy() {
			node.removeEventListener('keydown', handleKeyDown);
			// Restore focus to the element that had it before the modal opened
			// Check type safely
			if (previousActiveElement instanceof HTMLElement) {
				previousActiveElement.focus();
			}
		}
	};
};
