# bpterminal

A personal website with a terminal-style interface, built using SvelteKit.

## Features

*   **Terminal Interface:** Navigate the site and interact with content using command-line inputs (on the home page or via the command bar).
*   **SvelteKit Powered:** Modern web development with Svelte and Vite.
*   **TypeScript:** Type safety for enhanced reliability.
*   **Markdown Blog:** Content managed via Markdown files with frontmatter (`content/blog/`).
*   **Theming:** Customize terminal colors and fonts using `set-theme` and `set-font` commands.
*   **Basic Commands:** Includes `help`, `ls`, `cd`, `cat`, `date`, `clear`, and theme commands.

## Tech Stack

*   SvelteKit
*   Svelte 5
*   TypeScript
*   Vite
*   GSAP (for minor animations)
*   mdsvex (for Markdown processing)
*   ESLint + Prettier

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd bpterminal
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or pnpm install / yarn install
    ```

## Development

Start the development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Other useful scripts:

*   `npm run check`: Run SvelteKit type checking.
*   `npm run lint`: Check formatting with Prettier and lint with ESLint.
*   `npm run format`: Automatically format code with Prettier.

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

**Note:** To deploy your app, you will need to install and configure a SvelteKit [adapter](https://kit.svelte.dev/docs/adapters) suitable for your target environment (e.g., `adapter-node`, `adapter-static`, `adapter-vercel`). The default `@sveltejs/adapter-auto` is not intended for production deployment.

## Basic Commands

Use the terminal interface on the home page (`/`) or the persistent command bar at the bottom.

*   `help`: List available commands.
*   `help <command>`: Show details for a specific command.
*   `ls`: List available pages/directories from the root.
*   `cd <page>`: Navigate to a specific page (e.g., `cd about`).
*   `cat <page>`: Display a basic content overview for a page (currently placeholder for most).
*   `clear`: Clear the terminal output (only on the home page).
*   `date`: Show the current date and time.
*   `list-fonts`: List available fonts for theming.
*   `set-font <index|name>`: Change the terminal font.
*   `set-theme <#primaryHex> <#secondaryHex>`: Set primary (text) and secondary (background) colors.
*   `reset-theme`: Restore default theme settings.

(Press `?` button for an in-app command guide).

## Project Structure

```
.
├── .gitignore
├── .npmrc
├── .prettierignore
├── .prettierrc
├── .svelte-kit/
├── content/
├── e2e/
├── eslint.config.js
├── node_modules/
├── package-lock.json
├── package.json
├── playwright.config.ts
├── README.md
├── src/
├── static/
├── svelte.config.js
├── terminal-website-requirements.md
├── tsconfig.json
└── vite.config.ts
```
