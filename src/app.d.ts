// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

    // Add custom event types for Svelte actions
    namespace svelteHTML {
        interface HTMLAttributes<T> {
            'on:typewriterComplete'?: (event: CustomEvent<any>) => void;
        }
    }
}

export {};
