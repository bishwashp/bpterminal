<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
  import CommandBar from "$lib/components/CommandBar.svelte";
  import NavMenu from "$lib/components/NavMenu.svelte";

  // Determine if we are on the home page
  $: isHomePage = $page.url.pathname === '/';
</script>

<main class:home-page={isHomePage}>
  <slot />
</main>

<!-- Persistent UI Elements -->
<NavMenu />
<CommandBar />

<style>
  main {
    /* Ensure content has space and doesn't overlap fixed elements */
    padding-bottom: 4rem; /* Adjust based on CommandBar height */
  }

  main.home-page {
     padding-bottom: 0; /* No padding needed on home page */
  }

  /* Add any other global layout styles here */
</style> 