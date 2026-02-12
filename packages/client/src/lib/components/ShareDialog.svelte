<script lang="ts">
  import { api, type SheetShare } from '$lib/api';
  import { t } from '$lib/i18n';

  let { sheetId, userId, onClose }: { sheetId: string; userId: string; onClose: () => void } = $props();

  let username = $state('');
  let shares: SheetShare[] = $state([]);
  let loading = $state(true);
  let sharing = $state(false);
  let error = $state('');
  let success = $state('');

  loadShares();

  async function loadShares() {
    loading = true;
    try {
      shares = await api.getSheetShares(sheetId);
    } catch (e) {
      console.error('Failed to load shares:', e);
    } finally {
      loading = false;
    }
  }

  async function handleShare() {
    if (!username.trim()) return;
    sharing = true;
    error = '';
    success = '';
    try {
      const result = await api.shareSheet(sheetId, username.trim(), userId);
      success = $t('shareSuccess');
      username = '';
      await loadShares();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('User not found')) {
        error = $t('userNotFound');
      } else if (msg.includes('Cannot share with yourself')) {
        error = $t('cannotShareWithSelf');
      } else if (msg.includes('Already shared')) {
        error = $t('alreadyShared');
      } else {
        error = $t('shareError');
      }
    } finally {
      sharing = false;
    }
  }

  async function handleRemove(shareUserId: string) {
    try {
      await api.removeSheetShare(sheetId, shareUserId);
      await loadShares();
    } catch (e) {
      console.error('Failed to remove share:', e);
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
  <div class="card w-full max-w-md mx-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-themed-primary">{$t('shareSheet')}</h2>
      <button onclick={onClose} aria-label="Close" class="text-themed-muted hover:text-themed-primary transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <form onsubmit={(e) => { e.preventDefault(); handleShare(); }} class="flex gap-2 mb-4">
      <input
        type="text"
        bind:value={username}
        placeholder={$t('enterUsernameToShare')}
        class="input flex-1"
        disabled={sharing}
      />
      <button type="submit" class="btn btn-primary whitespace-nowrap" disabled={sharing || !username.trim()}>
        {$t('share')}
      </button>
    </form>

    {#if error}
      <p class="text-sm text-red-400 mb-3">{error}</p>
    {/if}
    {#if success}
      <p class="text-sm text-green-400 mb-3">{success}</p>
    {/if}

    <div>
      <h3 class="text-sm font-medium text-themed-accent mb-2 uppercase">{$t('sharedWith')}</h3>
      {#if loading}
        <p class="text-sm text-themed-muted">{$t('loading')}</p>
      {:else if shares.length === 0}
        <p class="text-sm text-themed-muted">{$t('noShares')}</p>
      {:else}
        <div class="space-y-2">
          {#each shares as share}
            <div class="flex items-center justify-between text-sm py-1 px-2 rounded bg-themed-tertiary/30">
              <span class="text-themed-secondary">{share.username}</span>
              <button
                onclick={() => handleRemove(share.user_id)}
                class="text-themed-faint hover:text-red-400 text-xs transition-colors"
              >
                {$t('removeShare')}
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
