<script lang="ts">
  import type { Sheet, CrewTemplateSchema, CrewTypeDef, CohortData, CrewMember } from '$lib/api';
  import { api } from '$lib/api';
  import { TrackInput, ClockInput } from '$lib/components';
  import { t, locale } from '$lib/i18n';
  import { onMount } from 'svelte';

  let { sheet, schema, updateData, saving, handleNameChange, readonly = false, onShare = undefined }: {
    sheet: Sheet;
    schema: CrewTemplateSchema;
    updateData: (key: string, value: unknown) => void;
    saving: boolean;
    handleNameChange: () => void;
    readonly?: boolean;
    onShare?: (() => void) | undefined;
  } = $props();

  let crewMembers: CrewMember[] = $state([]);

  onMount(async () => {
    try {
      crewMembers = await api.getCrewMembers(sheet.id);
    } catch (e) {
      console.error('Failed to load crew members:', e);
    }
  });

  let currentCrewType = $derived(getCrewType(sheet?.data?.crewType as string));
  let isEs = $derived($locale === 'es');
  let isSecta = $derived((sheet?.data?.crewType as string) === 'secta');
  let isContrabandistas = $derived((sheet?.data?.crewType as string) === 'contrabandistas');

  function getCrewType(key: string | undefined): CrewTypeDef | null {
    if (!key || !schema) return null;
    return schema.crewTypes[key] || null;
  }

  function getSelectedAbilities(): string[] {
    return (sheet?.data?.selectedAbilities ?? []) as string[];
  }

  function getSelectedCrewUpgrades(): string[] {
    return (sheet?.data?.selectedCrewUpgrades ?? []) as string[];
  }

  function getSelectedLairUpgrades(): string[] {
    return (sheet?.data?.selectedLairUpgrades ?? []) as string[];
  }

  function getClaimedTerritories(): string[] {
    return (sheet?.data?.claimedTerritories ?? []) as string[];
  }

  function getCohorts(): CohortData[] {
    return (sheet?.data?.cohorts ?? []) as CohortData[];
  }

  function getFactionStanding(): Record<string, number> {
    const val = sheet?.data?.factionStanding;
    if (val && typeof val === 'object') return val as Record<string, number>;
    return {};
  }

  function getSelectedDeityCharacteristics(): string[] {
    return (sheet?.data?.selectedDeityCharacteristics ?? []) as string[];
  }

  function getVehicleAdvantages(): string[] {
    return (sheet?.data?.vehicleAdvantages ?? []) as string[];
  }

  function getVehicleDefects(): string[] {
    return (sheet?.data?.vehicleDefects ?? []) as string[];
  }

  function toggleArrayItem(key: string, item: string) {
    const current = (sheet?.data?.[key] ?? []) as string[];
    const updated = current.includes(item)
      ? current.filter((c) => c !== item)
      : [...current, item];
    updateData(key, updated);
  }

  function updateFactionStanding(factionName: string, delta: number) {
    const current = getFactionStanding();
    const currentVal = current[factionName] || 0;
    const newVal = Math.max(-3, Math.min(3, currentVal + delta));
    updateData('factionStanding', { ...current, [factionName]: newVal });
  }

  function addCohort() {
    const cohorts = getCohorts();
    if (cohorts.length >= 4) return;
    const newCohort: CohortData = {
      type: '',
      name: '',
      edge: '',
      flaw: '',
      armor: false,
      quality: 0,
      conditions: []
    };
    updateData('cohorts', [...cohorts, newCohort]);
  }

  function updateCohort(index: number, field: string, value: unknown) {
    const cohorts = [...getCohorts()];
    cohorts[index] = { ...cohorts[index], [field]: value };
    updateData('cohorts', cohorts);
  }

  function removeCohort(index: number) {
    const cohorts = getCohorts().filter((_, i) => i !== index);
    updateData('cohorts', cohorts);
  }

  function labelFor(obj: { label?: string; labelEn?: string; nameEn?: string; name?: string }): string {
    if (isEs) return obj.label || obj.name || '';
    return obj.labelEn || obj.nameEn || obj.label || obj.name || '';
  }

  interface CustomClock {
    description: string;
    segments: number;
    value: number;
  }

  let customClocks = $derived((sheet?.data?.customClocks ?? []) as CustomClock[]);

  function addCustomClock() {
    updateData('customClocks', [...customClocks, { description: '', segments: 4, value: 0 }]);
  }

  function updateCustomClock(index: number, field: string, value: unknown) {
    const clocks = [...customClocks];
    clocks[index] = { ...clocks[index], [field]: value };
    if (field === 'segments') {
      const newSegments = value as number;
      if (clocks[index].value > newSegments) {
        clocks[index].value = newSegments;
      }
    }
    updateData('customClocks', clocks);
  }

  function removeCustomClock(index: number) {
    updateData('customClocks', customClocks.filter((_, i) => i !== index));
  }

  let collapsed: Record<string, boolean> = $state({});

  function toggleSection(key: string) {
    collapsed[key] = !collapsed[key];
  }
</script>

<div class="flex items-center justify-between mb-6">
  <div class="flex items-center gap-4">
    <a href="/sheets" class="text-themed-muted hover:text-themed-primary">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </a>
    <h1 class="text-2xl font-bold text-themed-primary">{sheet.name}</h1>
    {#if currentCrewType}
      <span class="text-sm text-themed-accent px-2 py-0.5 rounded border border-themed">
        {currentCrewType.name}
      </span>
    {/if}
  </div>
  <div class="flex items-center gap-3">
    {#if onShare}
      <button
        onclick={onShare}
        class="btn btn-secondary text-sm flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
        </svg>
        {$t('share')}
      </button>
    {/if}
    <div class="text-sm text-themed-muted">
      {saving ? $t('saving') : $t('saved')}
    </div>
  </div>
</div>

<fieldset disabled={readonly} class="contents">
<div class="space-y-6">
  <!-- 1. Crew Info -->
  <section class="card">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-themed-primary">{$t('crewInfo')}</h2>
      <button type="button" onclick={() => toggleSection('crewInfo')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['crewInfo'] ? '-rotate-90' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
      </button>
    </div>
    {#if !collapsed['crewInfo']}
    <div class="mt-4">
    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label for="crewName" class="label">{$t('name')}</label>
        <input type="text" id="crewName" bind:value={sheet.name} onblur={handleNameChange} class="input" />
      </div>
      <div>
        <label for="crewType" class="label">{$t('crewType')}</label>
        <select id="crewType" value={sheet.data.crewType || ''} onchange={(e) => updateData('crewType', e.currentTarget.value)} class="input">
          <option value="">{$t('selectCrewType')}</option>
          {#each Object.entries(schema.crewTypes) as [key, ct]}
            <option value={key}>{ct.name} ({ct.nameEn})</option>
          {/each}
        </select>
      </div>
      <div>
        <label for="reputation" class="label">{$t('reputation')}</label>
        <input type="text" id="reputation" value={sheet.data.reputation || ''} oninput={(e) => updateData('reputation', e.currentTarget.value)} class="input" placeholder={$t('reputationPlaceholder')} />
      </div>
      <div>
        <label for="tier" class="label">{$t('tier')}</label>
        <div class="flex items-center gap-3">
          <TrackInput label="" value={Number(sheet.data.tier) || 0} max={4} onChange={(v) => updateData('tier', v)} />
        </div>
      </div>
      <div>
        <span class="label">{$t('hold')}</span>
        <div class="flex gap-4 mt-1">
          <label class="flex items-center gap-2">
            <input type="radio" name="hold" value="weak" checked={sheet.data.hold === 'weak'} onchange={() => updateData('hold', 'weak')} class="border-themed bg-themed-tertiary text-themed-accent focus:ring-2" />
            <span class="text-themed-secondary">{$t('holdWeak')}</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" name="hold" value="strong" checked={sheet.data.hold === 'strong'} onchange={() => updateData('hold', 'strong')} class="border-themed bg-themed-tertiary text-themed-accent focus:ring-2" />
            <span class="text-themed-secondary">{$t('holdStrong')}</span>
          </label>
        </div>
      </div>
    </div>
    </div>
    {/if}
  </section>

  <!-- Crew Members (read-only) -->
  <section class="card">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-themed-primary">{$t('crewMembers')}</h2>
      <button type="button" onclick={() => toggleSection('crewMembers')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['crewMembers'] ? '-rotate-90' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
      </button>
    </div>
    {#if !collapsed['crewMembers']}
    <div class="mt-4">
      {#if crewMembers.length === 0}
        <p class="text-sm text-themed-muted">{$t('noMembers')}</p>
      {:else}
        <div class="space-y-2">
          {#each crewMembers as member}
            <div class="flex items-center gap-2 text-sm py-2 px-3 rounded bg-themed-tertiary/30 border border-themed">
              <span class="text-themed-primary font-medium">{member.name}</span>
              {#if member.playbook}
                <span class="text-themed-accent text-xs px-1.5 py-0.5 rounded border border-themed">{member.playbook}</span>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
    {/if}
  </section>

  <!-- 2. Rep & Heat -->
  <section class="card">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-themed-primary">{$t('repAndHeat')}</h2>
      <button type="button" onclick={() => toggleSection('repHeat')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['repHeat'] ? '-rotate-90' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
      </button>
    </div>
    {#if !collapsed['repHeat']}
    <div class="mt-4">
    <div class="grid gap-6 sm:grid-cols-2">
      <TrackInput label={$t('rep')} value={Number(sheet.data.rep) || 0} max={12} onChange={(v) => updateData('rep', v)} />
      <TrackInput label={$t('heat')} value={Number(sheet.data.heat) || 0} max={9} onChange={(v) => updateData('heat', v)} />
    </div>
    <div class="mt-4">
      <TrackInput label={$t('wantedLevel')} value={Number(sheet.data.wantedLevel) || 0} max={4} onChange={(v) => updateData('wantedLevel', v)} />
    </div>
    </div>
    {/if}
  </section>

  <!-- 3. Coin & Vaults -->
  <section class="card">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-themed-primary">{$t('coinAndVaults')}</h2>
      <button type="button" onclick={() => toggleSection('coinVaults')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['coinVaults'] ? '-rotate-90' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
      </button>
    </div>
    {#if !collapsed['coinVaults']}
    <div class="mt-4">
    <div class="grid gap-6 sm:grid-cols-2">
      <TrackInput label={$t('coin')} value={Number(sheet.data.coin) || 0} max={4} onChange={(v) => updateData('coin', v)} />
      <TrackInput label={$t('vaults')} value={Number(sheet.data.vaults) || 0} max={4} onChange={(v) => updateData('vaults', v)} />
    </div>
    </div>
    {/if}
  </section>

  <!-- 4. Special Abilities -->
  {#if currentCrewType}
    <section class="card">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-themed-primary">{$t('specialAbilities')}</h2>
        <button type="button" onclick={() => toggleSection('specialAbilities')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['specialAbilities'] ? '-rotate-90' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
        </button>
      </div>
      {#if !collapsed['specialAbilities']}
      <div class="mt-4">
      <div class="space-y-3">
        {#each currentCrewType.specialAbilities as ability}
          <label class="flex items-start gap-3 p-2 rounded hover:bg-themed-tertiary/50 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={getSelectedAbilities().includes(ability.name)}
              onchange={() => toggleArrayItem('selectedAbilities', ability.name)}
              class="mt-1 rounded border-themed bg-themed-tertiary text-themed-accent focus:ring-2"
            />
            <div>
              <span class="font-medium text-themed-primary">{ability.name}</span>
              {#if ability.nameEn}
                <span class="text-themed-faint text-xs ml-1">({ability.nameEn})</span>
              {/if}
              <p class="text-sm text-themed-muted mt-0.5">{ability.description}</p>
            </div>
          </label>
        {/each}
      </div>
      </div>
      {/if}
    </section>
  {/if}

  <!-- 5. Crew XP -->
  <section class="card">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-themed-primary">{$t('crewXp')}</h2>
      <button type="button" onclick={() => toggleSection('crewXp')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['crewXp'] ? '-rotate-90' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
      </button>
    </div>
    {#if !collapsed['crewXp']}
    <div class="mt-4">
    {#if currentCrewType}
      <div class="mb-4 p-3 rounded bg-themed-tertiary/50 border border-themed">
        <span class="text-xs font-medium text-themed-accent uppercase">{$t('xpTrigger')}</span>
        <p class="text-sm text-themed-secondary mt-1">{isEs ? currentCrewType.xpTrigger : currentCrewType.xpTriggerEn}</p>
      </div>
    {/if}
    <TrackInput label={$t('crewXp')} value={Number(sheet.data.crewXp) || 0} max={8} onChange={(v) => updateData('crewXp', v)} />
    </div>
    {/if}
  </section>

  <!-- 6. Crew Upgrades -->
  {#if currentCrewType}
    <section class="card">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-themed-primary">{$t('crewUpgrades')}</h2>
        <button type="button" onclick={() => toggleSection('crewUpgrades')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['crewUpgrades'] ? '-rotate-90' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
        </button>
      </div>
      {#if !collapsed['crewUpgrades']}
      <div class="mt-4">
      <div class="grid gap-1 sm:grid-cols-2">
        {#each currentCrewType.crewUpgrades as upgrade}
          <label class="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-themed-tertiary/50 cursor-pointer" title={upgrade.description}>
            <input
              type="checkbox"
              checked={getSelectedCrewUpgrades().includes(upgrade.name)}
              onchange={() => toggleArrayItem('selectedCrewUpgrades', upgrade.name)}
              class="rounded border-themed bg-themed-tertiary text-themed-accent focus:ring-2"
            />
            <span class="text-themed-secondary">{isEs ? upgrade.name : upgrade.nameEn}</span>
          </label>
        {/each}
      </div>
      </div>
      {/if}
    </section>
  {/if}

  <!-- 7. Lair Upgrades -->
  <section class="card">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-themed-primary">{$t('lairUpgrades')}</h2>
      <button type="button" onclick={() => toggleSection('lairUpgrades')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['lairUpgrades'] ? '-rotate-90' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
      </button>
    </div>
    {#if !collapsed['lairUpgrades']}
    <div class="mt-4">
    <div class="grid gap-1 sm:grid-cols-2">
      {#each schema.lairUpgrades as upgrade}
        <label class="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-themed-tertiary/50 cursor-pointer" title={upgrade.description}>
          <input
            type="checkbox"
            checked={getSelectedLairUpgrades().includes(upgrade.name)}
            onchange={() => toggleArrayItem('selectedLairUpgrades', upgrade.name)}
            class="rounded border-themed bg-themed-tertiary text-themed-accent focus:ring-2"
          />
          <span class="text-themed-secondary">{isEs ? upgrade.name : upgrade.nameEn}</span>
        </label>
      {/each}
    </div>
    </div>
    {/if}
  </section>

  <!-- 8. Territory Claims -->
  {#if currentCrewType}
    <section class="card">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-themed-primary">{$t('territoryClaims')}</h2>
        <button type="button" onclick={() => toggleSection('territoryClaims')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['territoryClaims'] ? '-rotate-90' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
        </button>
      </div>
      {#if !collapsed['territoryClaims']}
      <div class="mt-4">
      <div class="grid gap-1 sm:grid-cols-2">
        {#each currentCrewType.territoryClaims as claim}
          <label class="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-themed-tertiary/50 cursor-pointer" title={claim.description}>
            <input
              type="checkbox"
              checked={getClaimedTerritories().includes(claim.name)}
              onchange={() => toggleArrayItem('claimedTerritories', claim.name)}
              class="rounded border-themed bg-themed-tertiary text-themed-accent focus:ring-2"
            />
            <span class="text-themed-secondary">{isEs ? claim.name : claim.nameEn}</span>
          </label>
        {/each}
      </div>
      </div>
      {/if}
    </section>
  {/if}

  <!-- 9. Hunting Grounds -->
  {#if currentCrewType}
    <section class="card">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-themed-primary">{$t('huntingGrounds')}</h2>
        <button type="button" onclick={() => toggleSection('huntingGrounds')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['huntingGrounds'] ? '-rotate-90' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
        </button>
      </div>
      {#if !collapsed['huntingGrounds']}
      <div class="mt-4">
      <div class="space-y-2">
        {#each currentCrewType.huntingGrounds as ground}
          <label class="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-themed-tertiary/50 cursor-pointer">
            <input
              type="radio"
              name="huntingGrounds"
              value={ground.value}
              checked={sheet.data.huntingGrounds === ground.value}
              onchange={() => updateData('huntingGrounds', ground.value)}
              class="border-themed bg-themed-tertiary text-themed-accent focus:ring-2"
            />
            <div>
              <span class="text-themed-secondary font-medium">{labelFor(ground)}</span>
              {#if ground.description}
                <span class="text-themed-faint text-xs ml-1">- {ground.description}</span>
              {/if}
            </div>
          </label>
        {/each}
      </div>
      </div>
      {/if}
    </section>
  {/if}

  <!-- 10. Cohorts -->
  <section class="card">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-themed-primary">{$t('cohorts')}</h2>
      <button type="button" onclick={() => toggleSection('cohorts')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['cohorts'] ? '-rotate-90' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
      </button>
    </div>
    {#if !collapsed['cohorts']}
    <div class="mt-4">
    <div class="space-y-4">
      {#each getCohorts() as cohort, i}
        <div class="p-3 rounded border border-themed bg-themed-tertiary/30">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-themed-accent">{$t('cohort')} #{i + 1}</h3>
            <button
              type="button"
              onclick={() => removeCohort(i)}
              class="text-red-400 hover:text-red-300 text-xs"
            >
              {$t('remove')}
            </button>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="cohort-type-{i}" class="label">{$t('cohortType')}</label>
              <select id="cohort-type-{i}" value={cohort.type} onchange={(e) => updateCohort(i, 'type', e.currentTarget.value)} class="input">
                <option value="">{$t('selectCohortType')}</option>
                <option value="expert">{isEs ? 'Experto' : 'Expert'}</option>
                <option value="gang">{isEs ? 'Pandilla' : 'Gang'}</option>
              </select>
            </div>
            <div>
              <label for="cohort-name-{i}" class="label">{$t('name')}</label>
              <input type="text" id="cohort-name-{i}" value={cohort.name} oninput={(e) => updateCohort(i, 'name', e.currentTarget.value)} class="input" />
            </div>
            <div>
              <label for="cohort-edge-{i}" class="label">{$t('edge')}</label>
              <input type="text" id="cohort-edge-{i}" value={cohort.edge} oninput={(e) => updateCohort(i, 'edge', e.currentTarget.value)} class="input" placeholder={isEs ? 'Ventaja...' : 'Edge...'} />
            </div>
            <div>
              <label for="cohort-flaw-{i}" class="label">{$t('flaw')}</label>
              <input type="text" id="cohort-flaw-{i}" value={cohort.flaw} oninput={(e) => updateCohort(i, 'flaw', e.currentTarget.value)} class="input" placeholder={isEs ? 'Defecto...' : 'Flaw...'} />
            </div>
            <div>
              <span class="label">{$t('quality')}</span>
              <TrackInput label="" value={cohort.quality} max={4} onChange={(v) => updateCohort(i, 'quality', v)} />
            </div>
            <div class="flex items-center gap-4 mt-4">
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={cohort.armor}
                  onchange={(e) => updateCohort(i, 'armor', e.currentTarget.checked)}
                  class="rounded border-themed bg-themed-tertiary text-themed-accent focus:ring-2"
                />
                <span class="text-themed-secondary text-sm">{$t('armor')}</span>
              </label>
            </div>
          </div>
        </div>
      {/each}
      {#if getCohorts().length < 4}
        <button
          type="button"
          onclick={addCohort}
          class="btn btn-secondary text-sm"
        >
          + {$t('addCohort')}
        </button>
      {/if}
    </div>
    </div>
    {/if}
  </section>

  <!-- 11. Faction Standing -->
  <section class="card">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-themed-primary">{$t('factionStanding')}</h2>
      <button type="button" onclick={() => toggleSection('factionStanding')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['factionStanding'] ? '-rotate-90' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
      </button>
    </div>
    {#if !collapsed['factionStanding']}
    <div class="mt-4">
    <div class="space-y-4">
      {#each schema.factions as category}
        <div>
          <h3 class="text-sm font-medium text-themed-accent mb-2 uppercase">{isEs ? category.category : category.categoryEn}</h3>
          <div class="space-y-1">
            {#each category.factions as faction}
              <div class="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-themed-tertiary/50">
                <div class="flex items-center gap-2">
                  <span class="text-themed-secondary">{faction.name}</span>
                  <span class="text-themed-faint text-xs">(T{faction.tier})</span>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    onclick={() => updateFactionStanding(faction.name, -1)}
                    class="w-6 h-6 flex items-center justify-center rounded text-themed-muted hover:text-red-400 hover:bg-themed-tertiary"
                  >-</button>
                  <span class="w-6 text-center font-medium {getFactionStanding()[faction.name] > 0 ? 'text-green-400' : getFactionStanding()[faction.name] < 0 ? 'text-red-400' : 'text-themed-muted'}">
                    {getFactionStanding()[faction.name] || 0}
                  </span>
                  <button
                    type="button"
                    onclick={() => updateFactionStanding(faction.name, 1)}
                    class="w-6 h-6 flex items-center justify-center rounded text-themed-muted hover:text-green-400 hover:bg-themed-tertiary"
                  >+</button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
    </div>
    {/if}
  </section>

  <!-- 12. Secta: deity (conditional) -->
  {#if isSecta}
    <section class="card">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-themed-primary">{$t('deity')}</h2>
        <button type="button" onclick={() => toggleSection('deity')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['deity'] ? '-rotate-90' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
        </button>
      </div>
      {#if !collapsed['deity']}
      <div class="mt-4">
      <div class="mb-4">
        <label for="deityName" class="label">{$t('deityName')}</label>
        <input type="text" id="deityName" value={sheet.data.deityName || ''} oninput={(e) => updateData('deityName', e.currentTarget.value)} class="input" />
      </div>
      <div>
        <span class="label">{$t('deityCharacteristics')}</span>
        <div class="flex flex-wrap gap-2 mt-1">
          {#each schema.deityCharacteristics as char}
            <label class="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={getSelectedDeityCharacteristics().includes(char.value)}
                onchange={() => toggleArrayItem('selectedDeityCharacteristics', char.value)}
                class="rounded border-themed bg-themed-tertiary text-themed-accent focus:ring-2"
              />
              <span class="text-themed-secondary">{labelFor(char)}</span>
            </label>
          {/each}
        </div>
      </div>
      </div>
      {/if}
    </section>
  {/if}

  <!-- 13. Contrabandistas: vehicle (conditional) -->
  {#if isContrabandistas}
    <section class="card">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-themed-primary">{$t('vehicle')}</h2>
        <button type="button" onclick={() => toggleSection('vehicle')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['vehicle'] ? '-rotate-90' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
        </button>
      </div>
      {#if !collapsed['vehicle']}
      <div class="mt-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <span class="label">{$t('vehicleAdvantages')}</span>
          <div class="flex flex-wrap gap-2 mt-1">
            {#each schema.vehicleTraits.advantages as adv}
              <label class="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={getVehicleAdvantages().includes(adv.value)}
                  onchange={() => toggleArrayItem('vehicleAdvantages', adv.value)}
                  class="rounded border-themed bg-themed-tertiary text-themed-accent focus:ring-2"
                />
                <span class="text-themed-secondary">{labelFor(adv)}</span>
              </label>
            {/each}
          </div>
        </div>
        <div>
          <span class="label">{$t('vehicleDefects')}</span>
          <div class="flex flex-wrap gap-2 mt-1">
            {#each schema.vehicleTraits.defects as def}
              <label class="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={getVehicleDefects().includes(def.value)}
                  onchange={() => toggleArrayItem('vehicleDefects', def.value)}
                  class="rounded border-themed bg-themed-tertiary text-themed-accent focus:ring-2"
                />
                <span class="text-themed-secondary">{labelFor(def)}</span>
              </label>
            {/each}
          </div>
        </div>
      </div>
      </div>
      {/if}
    </section>
  {/if}

  <!-- 14. Contacts -->
  {#if currentCrewType}
    <section class="card">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-themed-primary">{$t('contacts')}</h2>
        <button type="button" onclick={() => toggleSection('contacts')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['contacts'] ? '-rotate-90' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
        </button>
      </div>
      {#if !collapsed['contacts']}
      <div class="mt-4">
      <div class="space-y-2">
        {#each currentCrewType.contacts as contact}
          <div class="flex items-center gap-2 text-sm py-1 px-2">
            <span class="text-themed-primary font-medium">{contact.name}</span>
            <span class="text-themed-muted">- {contact.description}</span>
          </div>
        {/each}
      </div>
      </div>
      {/if}
    </section>
  {/if}

  <!-- Custom Clocks -->
  <section class="card">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-themed-primary">{$t('customClocks')}</h2>
      <button type="button" onclick={() => toggleSection('customClocks')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['customClocks'] ? '-rotate-90' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
      </button>
    </div>
    {#if !collapsed['customClocks']}
    <div class="mt-4">
    <div class="space-y-4">
      {#each customClocks as clock, i}
        <div class="flex items-center gap-4 p-3 rounded border border-themed bg-themed-tertiary/30">
          <ClockInput
            label=""
            value={clock.value}
            segments={clock.segments}
            onChange={(v) => updateCustomClock(i, 'value', v)}
          />
          <input
            type="text"
            value={clock.description}
            oninput={(e) => updateCustomClock(i, 'description', e.currentTarget.value)}
            placeholder={$t('clockDescription')}
            class="input flex-1"
          />
          <div class="flex items-center gap-2">
            <label for="crew-clock-segments-{i}" class="text-xs text-themed-muted whitespace-nowrap">{$t('segments')}</label>
            <select
              id="crew-clock-segments-{i}"
              value={clock.segments}
              onchange={(e) => updateCustomClock(i, 'segments', Number(e.currentTarget.value))}
              class="input w-16 text-sm"
            >
              {#each [4, 6, 8, 10, 12] as s}
                <option value={s}>{s}</option>
              {/each}
            </select>
          </div>
          <button
            type="button"
            onclick={() => removeCustomClock(i)}
            class="text-red-400 hover:text-red-300 text-xs whitespace-nowrap"
          >
            {$t('remove')}
          </button>
        </div>
      {/each}
      <button
        type="button"
        onclick={addCustomClock}
        class="btn btn-secondary text-sm"
      >
        + {$t('addClock')}
      </button>
    </div>
    </div>
    {/if}
  </section>

  <!-- 15. Notes -->
  <section class="card">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-themed-primary">{$t('notes')}</h2>
      <button type="button" onclick={() => toggleSection('notes')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['notes'] ? '-rotate-90' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
      </button>
    </div>
    {#if !collapsed['notes']}
    <div class="mt-4">
    <textarea
      value={sheet.data.notes || ''}
      oninput={(e) => updateData('notes', e.currentTarget.value)}
      class="input"
      rows="6"
      placeholder={$t('notesPlaceholder')}
    ></textarea>
    </div>
    {/if}
  </section>
</div>
</fieldset>
