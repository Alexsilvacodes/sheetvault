<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api, type Template } from '$lib/api';
  import { user, isLoggedIn, theme } from '$lib/stores';
  import { TemplateCard } from '$lib/components';
  import { t } from '$lib/i18n';

  let templates: Template[] = $state([]);
  let loading = $state(true);
  let error = $state('');
  let creating = $state(false);
  let showModal = $state(false);
  let selectedTemplate: Template | null = $state(null);
  let characterName = $state('');

  onMount(async () => {
    theme.reset();

    if (!$isLoggedIn) {
      goto('/');
      return;
    }

    try {
      templates = await api.getTemplates();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load templates';
    } finally {
      loading = false;
    }
  });

  function handleSelectTemplate(template: Template) {
    selectedTemplate = template;
    characterName = '';
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    selectedTemplate = null;
    characterName = '';
  }

  async function handleCreate() {
    if (!selectedTemplate || !characterName.trim() || !$user) {
      return;
    }

    creating = true;
    try {
      const sheet = await api.createSheet({
        userId: $user.id,
        templateId: selectedTemplate.id,
        name: characterName.trim()
      });
      goto(`/sheets/${sheet.id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : $t('failedToCreate'));
    } finally {
      creating = false;
    }
  }
</script>

<svelte:head>
  <title>{$t('chooseTemplate')} - {$t('appName')}</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-8">
  <div class="flex items-center gap-4 mb-6">
    <a href="/sheets" class="text-themed-muted hover:text-themed-primary">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </a>
    <h1 class="text-2xl font-bold text-themed-primary">{$t('chooseTemplate')}</h1>
  </div>

  {#if loading}
    <div class="text-center py-12 text-themed-muted">{$t('loading')}</div>
  {:else if error}
    <div class="text-center py-12 text-red-400">{error}</div>
  {:else if templates.length === 0}
    <div class="text-center py-12 text-themed-muted">
      {$t('noTemplates')}
    </div>
  {:else}
    <div class="grid gap-4 sm:grid-cols-2">
      {#each templates as template (template.id)}
        <TemplateCard {template} onSelect={handleSelectTemplate} />
      {/each}
    </div>
  {/if}
</div>

<!-- Create Sheet Modal -->
{#if showModal && selectedTemplate}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    onclick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
    onkeydown={(e) => e.key === 'Escape' && closeModal()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="card max-w-md w-full">
      <h2 class="text-xl font-bold text-themed-primary mb-4">
        {#if selectedTemplate.type === 'crew'}
          {$t('newCrew', { template: selectedTemplate.name })}
        {:else}
          {$t('newCharacter', { template: selectedTemplate.name })}
        {/if}
      </h2>
      <form onsubmit={(e) => { e.preventDefault(); handleCreate(); }}>
        <div class="mb-4">
          <label for="characterName" class="label">
            {#if selectedTemplate.type === 'crew'}
              {$t('crewName')}
            {:else}
              {$t('characterName')}
            {/if}
          </label>
          <input
            type="text"
            id="characterName"
            bind:value={characterName}
            class="input"
            placeholder={selectedTemplate.type === 'crew' ? $t('enterCrewName') : $t('enterCharacterName')}
            disabled={creating}
          />
        </div>
        <div class="flex gap-3 justify-end">
          <button
            type="button"
            onclick={closeModal}
            class="btn btn-secondary"
            disabled={creating}
          >
            {$t('cancel')}
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            disabled={creating || !characterName.trim()}
          >
            {creating ? $t('creating') : $t('create')}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
