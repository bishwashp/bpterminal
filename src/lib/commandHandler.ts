import { goto } from '$app/navigation';
import { theme, availableFonts as themeAvailableFonts } from '$lib/stores/themeStore'; // Import store and options

// Re-export availableFonts from the theme store for convenience in command handler
export const availableFonts = themeAvailableFonts;

// Define the structure for a command
export interface Command {
    description: string;
    // Action can return text output (string/string[]), a special signal (like __CLEAR__), or nothing (void)
    action: (args: string[], currentPath: string) => Promise<string[] | string | void> | string[] | string | void;
}

// Store available commands
const commands: { [key: string]: Command } = {};

// --- Core Commands ---

commands['help'] = {
    description: 'Lists commands or shows details for a specific command. Usage: help [command]',
    action: (args: string[]) => {
        const commandName = args[0];

        if (commandName) {
            // Show help for a specific command
            if (commands[commandName]) {
                return [
                    `${commandName}: ${commands[commandName].description}`,
                    // Add more details here if needed, e.g., usage examples
                ];
            } else {
                return `help: command not found: ${commandName}`;
            }
        } else {
            // List all commands
            const helpOutput = ['Available commands:'];
            Object.keys(commands).sort().forEach(cmd => {
                helpOutput.push(`  ${cmd.padEnd(15)} - ${commands[cmd].description}`);
            });
            helpOutput.push("\nType 'help <command>' for more details on a specific command.");
            return helpOutput;
        }
    }
};

commands['clear'] = {
    description: 'Clears the terminal screen.',
    action: () => {
        // Special signal handled by the UI component
        return '__CLEAR__'; 
    }
};

commands['date'] = {
    description: 'Displays the current date and time.',
    action: () => {
        return new Date().toString();
    }
}

// --- Navigation Commands (Simulated) ---

// Define valid "directories" (our website sections)
const validPaths: { [key: string]: string[] } = {
    '/': ['about', 'projects', 'blog', 'contact'],
    // Add subdirectories if needed later, e.g., '/blog': ['post1', 'post2']
};

// Helper to get valid completions for a given path
function getCompletionsForPath(path: string): string[] {
    return validPaths[path] || [];
}

commands['ls'] = {
    description: 'Lists directory contents (available pages).',
    action: (args: string[], currentPath: string = '/') => {
        // For now, always list content of root, ignoring args/currentPath
        // Later, could be refined: const targetPath = args[0] || currentPath;
        const targetPath = '/'; 
        const contents = getCompletionsForPath(targetPath);
        if (contents.length > 0) {
            return contents; // Return as an array, will be joined by executeCommand
        } else {
            // This case shouldn't happen with our current setup, but good practice
            return `ls: cannot access '${targetPath}': No such file or directory`;
        }
    }
};

commands['cd'] = {
    description: 'Changes the directory (navigates to a page). Usage: cd <page>',
    action: async (args: string[], currentPath: string) => {
        const target = args[0];
        if (!target) {
            return 'usage: cd <directory>';
        }

        const homeCompletions = getCompletionsForPath('/');

        // Handle 'cd /' or 'cd ~' to go home
        if (target === '/' || target === '~') {
            if (currentPath !== '/') {
                 await goto('/');
                 // Return void or empty string, navigation is the action
            } 
            return; // Already home or navigation started
        }

        // Handle 'cd ..' 
        if (target === '..') {
            if (currentPath !== '/') {
                 // Basic parent logic, assumes one level deep for now
                await goto('/'); 
            } 
            return; // Already home or navigation started
        }
        
        // Check if it's a valid target from the root
        if (homeCompletions.includes(target)) {
             if (`/${target}` !== currentPath) {
                await goto(`/${target}`); // Use SvelteKit navigation
                // Return void, navigation is the action
             } 
             return; // Navigation started or already there
        } 

        // If none of the above match
        return `cd: no such file or directory: ${target}`;
        
    }
};

// --- Content Commands ---

commands['cat'] = {
    description: 'Displays the content of a page/file. Usage: cat <page>',
    action: async (args: string[], currentPath: string) => {
        const target = args[0];
        if (!target) return 'usage: cat <page_name>';

        // Check if target is a valid page from the root
        const validPages = getCompletionsForPath('/'); // Get ['about', 'projects', ...]
        if (validPages.includes(target)) {
            // TODO: Fetch actual content from the corresponding page component or a content source.
            // For now, return placeholder text.
            switch (target) {
                case 'about': 
                    return ['# About Me', 'Placeholder content for the about page.', 'Skills: Svelte, TypeScript, Linux...'];
                case 'projects':
                    return ['# Projects', 'Project 1: Terminal Website', 'Project 2: ...'];
                 case 'blog':
                    return ['# Blog', 'List of posts will go here...']; // Later: Fetch posts?
                case 'contact':
                     return ['# Contact', 'Use the form on /contact or email directly at placeholder@example.com'];
                 default:
                    return `Simulated content for page: ${target}`;
            }
        } 
        // Allow 'cat .', 'cat /', or 'cat ~' to show current/home page info?
        else if ((target === '.' || target === '/' || target === '~') && currentPath === '/') {
            return ['# Home (/)', 'This is the main terminal interface.', 'Type \'help\' for commands.'];
        } 
        // Add similar logic if we allow `cat .` on subpages later
        else {
            return `cat: ${target}: No such file or directory`;
        }
    }
};

// --- Theme/Customization Commands ---

commands['list-fonts'] = {
    description: 'Lists available fonts.',
    action: () => {
        return ['Available fonts:', ...availableFonts.map((f, i) => 
            `  [${i}] ${f.split(',')[0].replace(/['\"]/g, '')}` // Show index and clean name
        )];
    }
};

commands['set-font'] = {
    description: 'Sets the font. Usage: set-font <index|name>',
    action: (args: string[]) => {
        const input = args.join(' ').trim();
        if (!input) return 'Usage: set-font <index_number | partial_name>';

        let selectedFont: string | undefined;
        // Try matching by index
        const index = parseInt(input, 10);
        if (!isNaN(index) && index >= 0 && index < availableFonts.length) {
            selectedFont = availableFonts[index];
        } else {
            // Try matching by name (case-insensitive, partial match on primary name)
            const lowerInput = input.toLowerCase();
            selectedFont = availableFonts.find(f => 
                f.split(',')[0].replace(/['\"]/g, '').toLowerCase().includes(lowerInput)
            );
        }

        if (selectedFont) {
            const success = theme.setFont(selectedFont);
            return success 
                ? `Font set to ${selectedFont.split(',')[0].replace(/['\"]/g, '')}.` 
                : `Error setting font.`; // Should not happen if validation passed
        } else {
            return `Font not found: ${input}. Use 'list-fonts' to see options.`;
        }
    }
};

commands['set-theme'] = {
    description: 'Sets primary (text) and background colors. Usage: set-theme <#hex1> <#hex2>',
    action: (args: string[]) => {
        const primary = args[0];
        const secondary = args[1];
        if (!primary || !secondary) return 'Usage: set-theme <#primaryHex> <#secondaryHex>';

        const success = theme.setColors(primary, secondary);

        if (success) {
             return `Theme colors set to Primary: ${primary}, Secondary: ${secondary}.`;
        } else {
            return `Invalid color format. Use hex codes like #RRGGBB (e.g., #00ff00 #000000).`;
        }
    }
};

commands['reset-theme'] = {
    description: 'Resets theme to default colors and font.',
    action: () => {
        theme.reset();
        return 'Theme reset to defaults.';
    }
};

// --- Execution Function ---

export async function executeCommand(input: string, currentPath: string): Promise<string[] | string> {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
        return ''; // No command entered
    }

    const parts = trimmedInput.split(/\s+/); // Split by whitespace
    const commandName = parts[0];
    const args = parts.slice(1);

    if (commands[commandName]) {
        try {
            const result = await commands[commandName].action(args, currentPath);

            // Process result: void/null/undefined become empty string,
            // arrays are returned as is, others converted to string.
            if (result === undefined || result === null) {
                return '';
            } else if (Array.isArray(result)) {
                 // Pass array directly, UI will handle joining if needed
                return result;
            } else {
                // Return strings directly (including special signals like __CLEAR__)
                return String(result);
            }
        } catch (error: any) {
            console.error(`Error executing command '${commandName}':`, error);
            return `Error: ${error.message || 'An unexpected error occurred.'}`;
        }
    } else {
        return `command not found: ${commandName}`;
    }
}

// --- Autocompletion Helpers ---

// Function to get command names for autocompletion
export function getAvailableCommands(): string[] {
    return Object.keys(commands);
}

// Function to get potential path completions (relative to root for now)
export function getPathCompletions(currentPath: string): string[] {
    // Currently only supports completion from root
    return getCompletionsForPath('/');
    // Later: Could check currentPath and provide relative options or sub-paths
} 