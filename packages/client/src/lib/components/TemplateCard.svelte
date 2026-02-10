<script lang="ts">
  import type { Template } from '$lib/api';
  import { t } from '$lib/i18n';

  let { template, onSelect }: { template: Template; onSelect: (template: Template) => void } = $props();
</script>

<button
  onclick={() => onSelect(template)}
  class="card text-left w-full"
>
  <h3 class="text-lg font-semibold text-themed-primary mb-1">{template.name}</h3>
  <p class="text-sm text-themed-muted">{$t('createNew')} {template.name} {$t('characterSheet')}</p>
</button>
