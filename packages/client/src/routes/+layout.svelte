<script lang="ts">
  import '../app.css';
  import { Header } from '$lib/components';
  import { user, theme } from '$lib/stores';
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  onMount(() => {
    user.restore();
  });

  let themeClass = $derived($theme === 'blades' ? 'theme-blades' : '');
</script>

<div class="min-h-screen flex flex-col {themeClass}">
  <Header />
  <main class="flex-1">
    {@render children()}
  </main>
</div>
