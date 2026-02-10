<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api, type Sheet } from '$lib/api';
  import { user, isLoggedIn, theme } from '$lib/stores';
  import { SheetCard } from '$lib/components';
  import { t } from '$lib/i18n';

  let sheets: Sheet[] = $state([]);
  let loading = $state(true);
  let error = $state('');

  onMount(async () => {
    theme.reset();

    if (!$isLoggedIn) {
      goto('/');
      return;
    }

    await loadSheets();
  });

  async function loadSheets() {
    loading = true;
    error = '';
    try {
      sheets = await api.getSheets($user!.id);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load sheets';
    } finally {
      loading = false;
    }
  }

  async function handleDelete(sheetId: string) {
    if (!confirm($t('confirmDelete'))) {
      return;
    }

    try {
      await api.deleteSheet(sheetId);
      sheets = sheets.filter((s) => s.id !== sheetId);
    } catch (e) {
      alert(e instanceof Error ? e.message : $t('failedToDelete'));
    }
  }
</script>

<svelte:head>
  <title>{$t('mySheets')} - {$t('appName')}</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-8">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold text-themed-primary">{$t('mySheets')}</h1>
    <a href="/templates" class="btn btn-primary">{$t('newSheet')}</a>
  </div>

  {#if loading}
    <div class="text-center py-12 text-themed-muted">{$t('loading')}</div>
  {:else if error}
    <div class="text-center py-12 text-red-400">{error}</div>
  {:else if sheets.length === 0}
    <div class="text-center py-12">
      <p class="text-themed-muted mb-4">{$t('noSheets')}</p>
      <a href="/templates" class="btn btn-primary">{$t('createFirstSheet')}</a>
    </div>
  {:else}
    <div class="grid gap-4 sm:grid-cols-2">
      {#each sheets as sheet (sheet.id)}
        <div class="relative group">
          <SheetCard {sheet} />
          {#if sheet.permission === 'owner'}
            <button
              onclick={(e) => { e.preventDefault(); handleDelete(sheet.id); }}
              class="absolute top-2 right-2 p-1 text-themed-faint hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title={$t('deleteSheet')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
