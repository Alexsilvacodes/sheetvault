<script lang="ts">
  import { user, isLoggedIn } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { t } from '$lib/i18n';

  let username = $state('');
  let error = $state('');
  let loading = $state(false);

  onMount(() => {
    if ($isLoggedIn) {
      goto('/sheets');
    }
  });

  async function handleSubmit() {
    if (!username.trim()) {
      error = $t('pleaseEnterUsername');
      return;
    }

    loading = true;
    error = '';

    try {
      await user.login(username.trim());
      goto('/sheets');
    } catch (e) {
      error = e instanceof Error ? e.message : $t('failedToLogin');
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>{$t('appName')} - RPG Character Sheet Manager</title>
</svelte:head>

<div class="max-w-md mx-auto px-4 py-16">
  <div class="text-center mb-8">
    <img src="/logo.png" alt="" class="w-24 h-24 mx-auto mb-4 rounded-lg" />
    <h1 class="text-4xl font-bold text-themed-primary mb-2">{$t('appName')}</h1>
    <p class="text-themed-muted">{$t('tagline')}</p>
  </div>

  <div class="card">
    <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
      <div>
        <label for="username" class="label">{$t('enterUsername')}</label>
        <input
          type="text"
          id="username"
          bind:value={username}
          placeholder={$t('usernamePlaceholder')}
          class="input"
          disabled={loading}
          autocomplete="username"
          autocapitalize="none"
        />
      </div>

      {#if error}
        <p class="text-red-400 text-sm">{error}</p>
      {/if}

      <button type="submit" class="btn btn-primary w-full" disabled={loading}>
        {loading ? $t('loading') : $t('continue')}
      </button>
    </form>

    <p class="text-themed-faint text-sm mt-4 text-center">
      {$t('noPasswordNeeded')}
    </p>
  </div>
</div>
