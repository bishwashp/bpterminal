import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface ThemeSettings {
	primaryColor: string;
	secondaryColor: string;
	fontFamily: string;
}

// --- Available Options ---
export const availableFonts = [
	"'SF Mono', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace", // Default
	"'Courier New', Courier, monospace",
	"'Lucida Console', Monaco, monospace",
	"'Fira Code', monospace", // Consider adding Google Font import if used
	"'Roboto Mono', monospace" // Consider adding Google Font import if used
];

export const defaultTheme: ThemeSettings = {
	primaryColor: '#00ff00', // Default green
	secondaryColor: '#000000', // Default black
	fontFamily: availableFonts[0]
};

// --- Store Logic ---
const STORAGE_KEY = 'bpterminal-theme';

// Function to get initial theme from localStorage or use defaults
function getInitialTheme(): ThemeSettings {
	if (!browser) return defaultTheme; // Server-side rendering safety

	const storedSettings = localStorage.getItem(STORAGE_KEY);
	if (storedSettings) {
		try {
			const parsed = JSON.parse(storedSettings);
			// Validate parsed settings
			return {
				primaryColor:
					parsed.primaryColor && /^#[0-9a-fA-F]{6}$/.test(parsed.primaryColor)
						? parsed.primaryColor
						: defaultTheme.primaryColor,
				secondaryColor:
					parsed.secondaryColor && /^#[0-9a-fA-F]{6}$/.test(parsed.secondaryColor)
						? parsed.secondaryColor
						: defaultTheme.secondaryColor,
				fontFamily: availableFonts.includes(parsed.fontFamily)
					? parsed.fontFamily
					: defaultTheme.fontFamily
			};
		} catch (e) {
			console.error('Failed to parse theme settings from localStorage', e);
			localStorage.removeItem(STORAGE_KEY); // Clear invalid stored data
			return defaultTheme;
		}
	}
	return defaultTheme;
}

// Create the writable store
const themeSettingsStore = writable<ThemeSettings>(getInitialTheme());

// Function to convert hex to RGB array
function hexToRgb(hex: string): [number, number, number] | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
		: null;
}

// Function to apply theme settings as CSS variables
function applyTheme(settings: ThemeSettings) {
	if (browser) {
		document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
		document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
		document.documentElement.style.setProperty('--font-family', settings.fontFamily);
		document.documentElement.style.setProperty('--error-color', '#ff0000');
		document.documentElement.style.setProperty('--caret-color', settings.primaryColor);

		// Update primary color RGB variable
		const rgb = hexToRgb(settings.primaryColor);
		if (rgb) {
			document.documentElement.style.setProperty('--primary-color-rgb', rgb.join(', '));
		} else {
			// Fallback if hex conversion fails (shouldn't happen with validation)
			document.documentElement.style.setProperty('--primary-color-rgb', '0, 255, 0');
		}
	}
}

// Subscribe to changes and update localStorage + CSS variables
themeSettingsStore.subscribe((settings) => {
	if (browser) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
		applyTheme(settings);
	}
});

// Apply initial theme on load (client-side)
if (browser) {
	applyTheme(getInitialTheme());
}

// Export store methods
export const theme = {
	subscribe: themeSettingsStore.subscribe,
	set: themeSettingsStore.set, // Use with caution, prefer specific setters
	update: themeSettingsStore.update,
	get: () => get(themeSettingsStore), // Getter for current settings
	reset: () => themeSettingsStore.set(defaultTheme),
	setFont: (font: string) => {
		if (availableFonts.includes(font)) {
			themeSettingsStore.update((s) => ({ ...s, fontFamily: font }));
			return true; // Indicate success
		} else {
			console.warn(`Font '${font}' is not available.`);
			return false; // Indicate failure
		}
	},
	setColors: (primary: string, secondary: string) => {
		// Basic validation
		if (/^#[0-9a-fA-F]{6}$/.test(primary) && /^#[0-9a-fA-F]{6}$/.test(secondary)) {
			themeSettingsStore.update((s) => ({
				...s,
				primaryColor: primary,
				secondaryColor: secondary
			}));
			return true; // Indicate success
		} else {
			console.warn(`Invalid color format. Use hex codes like #RRGGBB.`);
			return false; // Indicate failure
		}
	}
};
