<script lang="ts">
  import type { Sheet } from '$lib/api';
  import { api } from '$lib/api';
  import { t } from '$lib/i18n';

  let { sheet }: { sheet: Sheet } = $props();

  let imageUrl = $derived(
    sheet.data?.image ? api.getImageUrl(sheet.data.image as string) : null
  );

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
  <div class="flex gap-4">
    {#if imageUrl}
      <div class="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden bg-themed-tertiary border border-themed">
        <img src={imageUrl} alt="" class="w-full h-full object-cover" />
      </div>
    {/if}
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-lg font-semibold text-themed-primary truncate">{sheet.name}</h3>
        <div class="flex items-center gap-2 flex-shrink-0">
          {#if sheet.permission === 'shared'}
            <span class="text-xs font-medium px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/50">{$t('sharedWithYou')}</span>
          {:else if sheet.permission === 'crew_member'}
            <span class="text-xs font-medium px-2 py-0.5 rounded bg-themed-accent/20 text-themed-accent border border-themed-accent/50">{$t('crewMember')}</span>
          {/if}
        </div>
      </div>
      <p class="text-sm text-themed-muted mb-2">{sheet.template_name || 'Unknown Template'}</p>
      <p class="text-xs text-themed-faint">{$t('updated')} {formatDate(sheet.updated_at)}</p>
    </div>
  </div>
</a>
