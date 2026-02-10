<script lang="ts">
  import type { Sheet } from '$lib/api';
  import { t } from '$lib/i18n';

  let { sheet }: { sheet: Sheet } = $props();

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
</script>

<a
  href="/sheets/{sheet.id}"
  class="card block"
>
  <div class="flex items-center justify-between mb-1">
    <h3 class="text-lg font-semibold text-themed-primary">{sheet.name}</h3>
    <div class="flex items-center gap-2">
      {#if sheet.permission === 'shared'}
        <span class="text-xs font-medium px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/50">{$t('sharedWithYou')}</span>
      {:else if sheet.permission === 'crew_member'}
        <span class="text-xs font-medium px-2 py-0.5 rounded bg-themed-accent/20 text-themed-accent border border-themed-accent/50">{$t('crewMember')}</span>
      {/if}
    </div>
  </div>
  <p class="text-sm text-themed-muted mb-2">{sheet.template_name || 'Unknown Template'}</p>
  <p class="text-xs text-themed-faint">{$t('updated')} {formatDate(sheet.updated_at)}</p>
</a>
