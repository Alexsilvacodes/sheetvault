<script lang="ts">
  import { locale, t, type Locale } from '$lib/i18n';

  const languages: { code: Locale; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' }
  ];
</script>

<div class="flex items-center gap-1">
  {#each languages as lang}
    <button
      onclick={() => locale.set(lang.code)}
      class="px-2 py-1 text-xs font-medium rounded transition-colors {$locale === lang.code
        ? 'bg-indigo-600 text-white'
        : 'text-vault-400 hover:text-vault-100 hover:bg-vault-700'}"
      title={lang.code === 'en' ? $t('english') : $t('spanish')}
    >
      {lang.label}
    </button>
  {/each}
</div>
