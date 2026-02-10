<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { api, type Sheet, type TemplateSchema, isCharacterSchema, isCrewSchema } from '$lib/api';
  import type { CharacterTemplateSchema, CrewTemplateSchema } from '$lib/api';
  import { user, isLoggedIn, theme } from '$lib/stores';
  import { CharacterSheetEditor, CrewSheetEditor, ShareDialog } from '$lib/components';
  import { t } from '$lib/i18n';

  let sheet: Sheet | null = $state(null);
  let schema: TemplateSchema | null = $state(null);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');
  let saveTimeout: ReturnType<typeof setTimeout>;
  let showShareDialog = $state(false);

  let sheetId = $derived($page.params.id);
  let canEdit = $derived(sheet?.permission === 'owner' || sheet?.permission === 'crew_member');
  let isShared = $derived(sheet?.permission === 'shared');
  let isCrewMember = $derived(sheet?.permission === 'crew_member');
  let isOwner = $derived(sheet?.permission === 'owner');

  onMount(async () => {
    if (!$isLoggedIn) {
      goto('/');
      return;
    }

    try {
      sheet = await api.getSheet(sheetId, $user!.id);
      schema = sheet.template_schema || null;
      theme.setFromTemplate(sheet.template_slug);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load sheet';
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    theme.reset();
    clearTimeout(saveTimeout);
  });

  function updateData(key: string, value: unknown) {
    if (!sheet || !canEdit) return;
    sheet.data = { ...sheet.data, [key]: value };
    debouncedSave();
  }

  function debouncedSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveSheet, 1000);
  }

  async function saveSheet() {
    if (!sheet || !canEdit) return;
    saving = true;
    try {
      await api.updateSheet(sheet.id, {
        name: sheet.name,
        data: sheet.data
      }, $user?.id);
    } catch (e) {
      console.error('Failed to save:', e);
    } finally {
      saving = false;
    }
  }

  function handleNameChange() {
    if (canEdit) saveSheet();
  }
</script>

<svelte:head>
  <title>{sheet?.name || $t('loading')} - {$t('appName')}</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-8">
  {#if loading}
    <div class="text-center py-12 text-themed-muted">{$t('loading')}</div>
  {:else if error}
    <div class="text-center py-12 text-red-400">{error}</div>
  {:else if sheet && schema}
    {#if isShared}
      <div class="mb-4 p-3 rounded bg-blue-500/10 border border-blue-500/30 text-sm text-blue-400">
        <span>{$t('viewOnlyBanner')}</span>
      </div>
    {:else if isCrewMember}
      <div class="mb-4 p-3 rounded bg-themed-accent/10 border border-themed-accent/30 text-sm text-themed-accent">
        <span>{$t('crewEditBanner')}</span>
      </div>
    {/if}

    {#if isCrewSchema(schema)}
      <CrewSheetEditor
        {sheet}
        schema={schema}
        {updateData}
        {saving}
        {handleNameChange}
        readonly={!canEdit}
        onShare={isOwner ? () => showShareDialog = true : undefined}
      />
    {:else}
      <CharacterSheetEditor
        {sheet}
        schema={schema}
        {updateData}
        {saving}
        {handleNameChange}
        readonly={!canEdit}
        onShare={isOwner ? () => showShareDialog = true : undefined}
      />
    {/if}

    {#if showShareDialog && $user}
      <ShareDialog
        sheetId={sheet.id}
        userId={$user.id}
        onClose={() => showShareDialog = false}
      />
    {/if}
  {/if}
</div>
