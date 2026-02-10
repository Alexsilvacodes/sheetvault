<script lang="ts">
  import { user, isLoggedIn } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { t } from '$lib/i18n';
  import LanguageSwitcher from './LanguageSwitcher.svelte';

  let menuOpen = $state(false);

  function handleLogout() {
    user.logout();
    menuOpen = false;
    goto('/');
  }

  function closeMenu() {
    menuOpen = false;
  }
</script>

<header class="header">
  <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <img src="/logo.png" alt="" class="h-8 w-8 rounded" />
      <span class="text-xl font-bold text-themed-primary">{$t('appName')}</span>
    </a>

    <!-- Desktop -->
    <div class="hidden sm:flex items-center gap-4">
      {#if $isLoggedIn}
        <nav class="flex gap-4">
          <a href="/sheets" class="text-themed-secondary hover:text-themed-primary transition-colors">
            {$t('mySheets')}
          </a>
          <a href="/templates" class="text-themed-secondary hover:text-themed-primary transition-colors">
            {$t('templates')}
          </a>
        </nav>
        <div class="flex items-center gap-3 pl-4 border-l border-themed">
          <span class="text-themed-muted text-sm">{$user?.username}</span>
          <button
            onclick={handleLogout}
            class="text-sm text-themed-muted hover:text-themed-primary transition-colors"
          >
            {$t('logout')}
          </button>
        </div>
      {/if}
      <div class="pl-4 border-l border-themed">
        <LanguageSwitcher />
      </div>
    </div>

    <!-- Mobile toggle -->
    <div class="flex items-center gap-3 sm:hidden">
      <LanguageSwitcher />
      {#if $isLoggedIn}
        <button
          onclick={() => menuOpen = !menuOpen}
          class="text-themed-muted hover:text-themed-primary transition-colors"
          aria-label="Menu"
        >
          {#if menuOpen}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          {/if}
        </button>
      {/if}
    </div>
  </div>

  <!-- Mobile menu -->
  {#if menuOpen && $isLoggedIn}
    <div class="sm:hidden border-t border-themed">
      <div class="max-w-7xl mx-auto px-4 py-3 space-y-3">
        <nav class="flex flex-col gap-2">
          <a href="/sheets" onclick={closeMenu} class="text-themed-secondary hover:text-themed-primary transition-colors py-1">
            {$t('mySheets')}
          </a>
          <a href="/templates" onclick={closeMenu} class="text-themed-secondary hover:text-themed-primary transition-colors py-1">
            {$t('templates')}
          </a>
        </nav>
        <div class="flex items-center justify-between pt-2 border-t border-themed">
          <span class="text-themed-muted text-sm">{$user?.username}</span>
          <button
            onclick={handleLogout}
            class="text-sm text-themed-muted hover:text-themed-primary transition-colors"
          >
            {$t('logout')}
          </button>
        </div>
      </div>
    </div>
  {/if}
</header>
