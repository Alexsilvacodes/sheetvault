<script lang="ts">
  import type { Sheet, CharacterTemplateSchema, PlaybookDef, CrewOption } from '$lib/api';
  import { api } from '$lib/api';
  import { RatingInput, TrackInput, ClockInput, ImageUpload } from '$lib/components';
  import { t, locale } from '$lib/i18n';
  import { user } from '$lib/stores/user';
  import { onMount } from 'svelte';

  let { sheet, schema, updateData, saving, handleNameChange, readonly = false, onShare = undefined }: {
    sheet: Sheet;
    schema: CharacterTemplateSchema;
    updateData: (key: string, value: unknown) => void;
    saving: boolean;
    handleNameChange: () => void;
    readonly?: boolean;
    onShare?: (() => void) | undefined;
  } = $props();

  let crewOptions: CrewOption[] = $state([]);
  let crewOptionsLoaded = $state(false);

  onMount(async () => {
    try {
      crewOptions = await api.getCrewSheets();
    } catch (e) {
      console.error('Failed to load crew sheets:', e);
    } finally {
      crewOptionsLoaded = true;
    }
  });

  interface CustomContact {
    name: string;
    description: string;
  }

  const attrXpConfig: Record<string, { xpKey: string; expKey: string; segments: number; maxExp: number }> = {
    insight: { xpKey: 'insightXp', expKey: 'insightExp', segments: 6, maxExp: 6 },
    prowess: { xpKey: 'prowessXp', expKey: 'prowessExp', segments: 6, maxExp: 6 },
    resolve: { xpKey: 'resolveXp', expKey: 'resolveExp', segments: 6, maxExp: 6 }
  };

  let currentPlaybook = $derived(getPlaybook(sheet?.data?.playbook as string));
  let isEs = $derived($locale === 'es');
  let selectedItems = $derived((sheet?.data?.selectedItems ?? []) as string[]);
  let selectedPlaybookItems = $derived((sheet?.data?.selectedPlaybookItems ?? []) as string[]);
  let totalLoad = $derived(calculateLoad(selectedItems, selectedPlaybookItems));
  let customFriends = $derived((sheet?.data?.customFriends ?? []) as CustomContact[]);
  let customRivals = $derived((sheet?.data?.customRivals ?? []) as CustomContact[]);
  let selectedAbilities = $derived((sheet?.data?.selectedAbilities ?? []) as string[]);
  let nextAbilityCost = $derived(selectedAbilities.length + 1);

  function getPlaybook(key: string | undefined): PlaybookDef | null {
    if (!key || !schema) return null;
    return schema.playbooks[key] || null;
  }

  function getTraumaConditions(): string[] {
    return (sheet?.data?.traumaConditions ?? []) as string[];
  }

  function getHarmArray(key: string): string[] {
    const val = sheet?.data?.[key];
    if (Array.isArray(val)) return val as string[];
    return key === 'harm3' ? [''] : ['', ''];
  }

  function toggleArrayItem(key: string, item: string) {
    const current = (sheet?.data?.[key] ?? []) as string[];
    const updated = current.includes(item)
      ? current.filter((c) => c !== item)
      : [...current, item];
    updateData(key, updated);
  }

  function getFriendStatus(): Record<string, string> {
    const val = sheet?.data?.friendStatus;
    if (val && typeof val === 'object') return val as Record<string, string>;
    return {};
  }

  function getContactStatus(contactName: string): string {
    return getFriendStatus()[contactName] || '';
  }

  function toggleContactStatus(contactName: string, status: string) {
    const current = getFriendStatus();
    const updated = { ...current };
    updated[contactName] = updated[contactName] === status ? '' : status;
    updateData('friendStatus', updated);
  }

  let newFriendName = $state('');
  let newFriendDesc = $state('');
  let newRivalName = $state('');
  let newRivalDesc = $state('');

  function addCustomFriend() {
    if (!newFriendName.trim()) return;
    updateData('customFriends', [...customFriends, { name: newFriendName.trim(), description: newFriendDesc.trim() }]);
    newFriendName = '';
    newFriendDesc = '';
  }

  function removeCustomFriend(index: number) {
    updateData('customFriends', customFriends.filter((_, i) => i !== index));
  }

  function addCustomRival() {
    if (!newRivalName.trim()) return;
    updateData('customRivals', [...customRivals, { name: newRivalName.trim(), description: newRivalDesc.trim() }]);
    newRivalName = '';
    newRivalDesc = '';
  }

  function removeCustomRival(index: number) {
    updateData('customRivals', customRivals.filter((_, i) => i !== index));
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

  function calculateLoad(items: string[], pbItems: string[]): number {
    if (!schema) return 0;
    let load = 0;
    for (const item of schema.sharedItems) {
      if (items.includes(item.name)) load += item.load;
    }
    if (currentPlaybook) {
      for (const item of currentPlaybook.items) {
        if (pbItems.includes(item.name)) load += item.load;
      }
    }
    return load;
  }

  function getLoadMax(): number {
    if (!schema) return 5;
    const level = sheet?.data?.loadLevel as string || 'normal';
    const def = schema.loadLevels.find(l => l.value === level);
    return def?.max ?? 5;
  }

  function labelFor(obj: { label: string; labelEn?: string; nameEn?: string; name?: string }): string {
    if (isEs) return obj.label || obj.name || '';
    return obj.labelEn || obj.nameEn || obj.label || obj.name || '';
  }

  function updateXp(xpKey: string, expKey: string, maxSegments: number, newValue: number, maxExp?: number) {
    if (newValue >= maxSegments) {
      updateData(xpKey, 0);
      const currentExp = Number(sheet.data[expKey]) || 0;
      const cap = maxExp ?? Infinity;
      if (currentExp < cap) {
        updateData(expKey, currentExp + 1);
      }
    } else {
      updateData(xpKey, newValue);
    }
  }

  function actionUpgradeCost(currentRating: number): number {
    if (currentRating >= 4) return 0;
    return Math.pow(2, currentRating);
  }

  function handleImageChange(filename: string | null) {
    updateData('image', filename ?? '');
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
    {#if currentPlaybook}
      <span class="text-sm text-themed-accent px-2 py-0.5 rounded border border-themed">
        {currentPlaybook.name}
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
<div class="grid gap-6 lg:grid-cols-2">
  <!-- Character Info -->
  <section class="card lg:col-span-2">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-themed-primary">{$t('characterInfo')}</h2>
      <button type="button" onclick={() => toggleSection('charInfo')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['charInfo'] ? '-rotate-90' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
      </button>
    </div>
    {#if !collapsed['charInfo']}
    <div class="mt-4">
    <div class="flex gap-6">
      <div class="flex-shrink-0">
        <ImageUpload
          sheetId={sheet.id}
          userId={$user?.id ?? ''}
          currentImage={sheet.data.image as string || undefined}
          {readonly}
          onImageChange={handleImageChange}
        />
      </div>
      <div class="flex-1">
    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label for="name" class="label">{$t('name')}</label>
        <input type="text" id="name" bind:value={sheet.name} onblur={handleNameChange} class="input" />
      </div>
      <div>
        <label for="alias" class="label">{$t('alias')}</label>
        <input type="text" id="alias" value={sheet.data.alias || ''} oninput={(e) => updateData('alias', e.currentTarget.value)} class="input" />
      </div>
      <div>
        <label for="playbook" class="label">{$t('playbook')}</label>
        <select id="playbook" value={sheet.data.playbook || ''} onchange={(e) => updateData('playbook', e.currentTarget.value)} class="input">
          <option value="">{$t('selectPlaybook')}</option>
          {#each Object.entries(schema.playbooks) as [key, pb]}
            <option value={key}>{pb.name} ({pb.nameEn})</option>
          {/each}
        </select>
      </div>
      <div>
        <label for="crew" class="label">{$t('crew')}</label>
        {#if crewOptionsLoaded}
          <select id="crew" value={sheet.data.crew || ''} onchange={(e) => updateData('crew', e.currentTarget.value)} class="input" disabled={readonly}>
            <option value="">{$t('noCrew')}</option>
            {#each crewOptions as crew}
              <option value={crew.id}>{crew.name}</option>
            {/each}
          </select>
        {:else}
          <select class="input" disabled>
            <option>{$t('loading')}</option>
          </select>
        {/if}
      </div>
      <div>
        <label for="heritage" class="label">{$t('heritage')}</label>
        <select id="heritage" value={sheet.data.heritage || ''} onchange={(e) => updateData('heritage', e.currentTarget.value)} class="input">
          <option value="">{$t('selectHeritage')}</option>
          {#each schema.heritages as h}
            <option value={h.value} title={h.description}>{h.label}</option>
          {/each}
        </select>
      </div>
      <div>
        <label for="background" class="label">{$t('background')}</label>
        <select id="background" value={sheet.data.background || ''} onchange={(e) => updateData('background', e.currentTarget.value)} class="input">
          <option value="">{$t('selectBackground')}</option>
          {#each schema.backgrounds as bg}
            <option value={bg.value} title={bg.description}>{bg.label}</option>
          {/each}
        </select>
      </div>
      <div>
        <label for="vice" class="label">{$t('vice')}</label>
        <select id="vice" value={sheet.data.vice || ''} onchange={(e) => updateData('vice', e.currentTarget.value)} class="input">
          <option value="">{$t('selectVice')}</option>
          {#each schema.vices as v}
            <option value={v.value} title={v.description}>{v.label}</option>
          {/each}
        </select>
      </div>
      <div>
        <label for="vicePurveyor" class="label">{$t('vicePurveyor')}</label>
        <input type="text" id="vicePurveyor" value={sheet.data.vicePurveyor || ''} oninput={(e) => updateData('vicePurveyor', e.currentTarget.value)} class="input" />
      </div>
    </div>
    <div class="mt-4">
      <label for="look" class="label">{$t('look')}</label>
      <textarea id="look" value={sheet.data.look || ''} oninput={(e) => updateData('look', e.currentTarget.value)} class="input" rows="2"></textarea>
    </div>
      </div>
    </div>
    </div>
    {/if}
  </section>

  <!-- Left column -->
  <div class="space-y-6">
    <!-- Actions & XP (merged) -->
    <section class="card">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-themed-primary">{$t('actions')}</h2>
        <button type="button" onclick={() => toggleSection('actions')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['actions'] ? '-rotate-90' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
        </button>
      </div>
      {#if !collapsed['actions']}
      <div class="mt-4">
      {#if currentPlaybook}
        <div class="mb-4 p-3 rounded bg-themed-tertiary/50 border border-themed">
          <span class="text-xs font-medium text-themed-accent uppercase">{$t('xpTrigger')}</span>
          <p class="text-sm text-themed-secondary mt-1">{isEs ? currentPlaybook.xpTrigger : currentPlaybook.xpTriggerEn}</p>
        </div>
      {/if}
      <div class="space-y-6">
        {#each Object.entries(schema.attributes) as [attrKey, attr]}
          {@const xpCfg = attrXpConfig[attrKey]}
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-medium text-themed-accent uppercase">{labelFor(attr)}</h3>
              {#if xpCfg}
                {@const currentExp = Number(sheet.data[xpCfg.expKey]) || 0}
                <div class="flex items-center gap-3">
                  <ClockInput
                    label="XP"
                    value={Number(sheet.data[xpCfg.xpKey]) || 0}
                    segments={xpCfg.segments}
                    onChange={(v) => updateXp(xpCfg.xpKey, xpCfg.expKey, xpCfg.segments, v, xpCfg.maxExp)}
                  />
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      class="w-5 h-5 flex items-center justify-center rounded text-xs font-bold bg-themed-tertiary text-themed-muted hover:text-themed-primary transition-colors"
                      onclick={() => updateData(xpCfg.expKey, Math.max(0, currentExp - 1))}
                      disabled={currentExp <= 0}
                    >-</button>
                    <span class="text-xs font-bold text-themed-accent min-w-[3.5rem] text-center" title={$t('experience')}>
                      {currentExp}/{xpCfg.maxExp} EXP
                    </span>
                    <button
                      type="button"
                      class="w-5 h-5 flex items-center justify-center rounded text-xs font-bold bg-themed-tertiary text-themed-muted hover:text-themed-primary transition-colors"
                      onclick={() => updateData(xpCfg.expKey, Math.min(xpCfg.maxExp, currentExp + 1))}
                      disabled={currentExp >= xpCfg.maxExp}
                    >+</button>
                  </div>
                </div>
              {/if}
            </div>
            <div class="space-y-2">
              {#each Object.entries(attr.actions) as [actionKey, action]}
                <div class="flex items-center gap-2">
                  <div class="flex-1">
                    <RatingInput
                      label={labelFor(action)}
                      value={Number(sheet.data[actionKey]) || 0}
                      max={action.max}
                      onChange={(v) => updateData(actionKey, v)}
                      splitFirst={true}
                    />
                  </div>
                  {#if Number(sheet.data[actionKey] || 0) < action.max}
                    <span class="text-xs text-themed-faint whitespace-nowrap">{actionUpgradeCost(Number(sheet.data[actionKey]) || 0)} EXP</span>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
      <!-- Playbook XP -->
      <div class="mt-6 pt-4 border-t border-themed">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-themed-accent uppercase">{$t('playbookXp')}</span>
          <div class="flex items-center gap-3">
            <ClockInput
              label="XP"
              value={Number(sheet.data.playbookXp) || 0}
              segments={6}
              onChange={(v) => updateXp('playbookXp', 'playbookExp', 6, v, 6)}
            />
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="w-5 h-5 flex items-center justify-center rounded text-xs font-bold bg-themed-tertiary text-themed-muted hover:text-themed-primary transition-colors"
                onclick={() => updateData('playbookExp', Math.max(0, (Number(sheet.data.playbookExp) || 0) - 1))}
                disabled={(Number(sheet.data.playbookExp) || 0) <= 0}
              >-</button>
              <span class="text-xs font-bold text-themed-accent min-w-[3.5rem] text-center">
                {Number(sheet.data.playbookExp) || 0}/6 EXP
              </span>
              <button
                type="button"
                class="w-5 h-5 flex items-center justify-center rounded text-xs font-bold bg-themed-tertiary text-themed-muted hover:text-themed-primary transition-colors"
                onclick={() => updateData('playbookExp', Math.min(6, (Number(sheet.data.playbookExp) || 0) + 1))}
                disabled={(Number(sheet.data.playbookExp) || 0) >= 6}
              >+</button>
            </div>
          </div>
        </div>
      </div>
      </div>
      {/if}
    </section>

    <!-- Stress & Trauma -->
    <section class="card">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-themed-primary">{$t('stressAndTrauma')}</h2>
        <button type="button" onclick={() => toggleSection('stressTrauma')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['stressTrauma'] ? '-rotate-90' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
        </button>
      </div>
      {#if !collapsed['stressTrauma']}
      <div class="mt-4">
      <div class="grid gap-6 sm:grid-cols-2">
        <TrackInput
          label={$t('stress')}
          value={Number(sheet.data.stress) || 0}
          max={9}
          onChange={(v) => updateData('stress', v)}
        />
        <TrackInput
          label={$t('trauma')}
          value={Number(sheet.data.trauma) || 0}
          max={4}
          onChange={(v) => updateData('trauma', v)}
        />
      </div>
      <div class="mt-4">
        <span class="label">{$t('traumaConditions')}</span>
        <div class="flex flex-wrap gap-2 mt-1">
          {#each schema.traumaConditions as condition}
            <label class="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={getTraumaConditions().includes(condition.value)}
                onchange={() => toggleArrayItem('traumaConditions', condition.value)}
                class="rounded border-themed bg-themed-tertiary text-themed-accent focus:ring-2"
              />
              <span class="text-themed-secondary">{labelFor(condition)}</span>
            </label>
          {/each}
        </div>
      </div>
      </div>
      {/if}
    </section>

    <!-- Harm -->
    <section class="card">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-themed-primary">{$t('harm')}</h2>
        <button type="button" onclick={() => toggleSection('harm')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['harm'] ? '-rotate-90' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
        </button>
      </div>
      {#if !collapsed['harm']}
      <div class="mt-4">
      <div class="space-y-3">
        <div>
          <label for="harm3" class="label">
            {$t('harmLevel3')}
            <span class="text-themed-faint font-normal ml-1">— {$t('needHelp')}</span>
          </label>
          <input type="text" id="harm3" value={getHarmArray('harm3')[0] || ''} oninput={(e) => updateData('harm3', [e.currentTarget.value])} class="input" />
        </div>
        <div class="grid gap-2 sm:grid-cols-2">
          <div>
            <label for="harm2a" class="label">
              {$t('harmLevel2')}
              <span class="text-themed-faint font-normal ml-1">— -1D</span>
            </label>
            <input type="text" id="harm2a" value={getHarmArray('harm2')[0] || ''} oninput={(e) => { const c = getHarmArray('harm2'); updateData('harm2', [e.currentTarget.value, c[1]]); }} class="input" />
          </div>
          <div>
            <label for="harm2b" class="label">&nbsp;</label>
            <input type="text" id="harm2b" value={getHarmArray('harm2')[1] || ''} oninput={(e) => { const c = getHarmArray('harm2'); updateData('harm2', [c[0], e.currentTarget.value]); }} class="input" />
          </div>
        </div>
        <div class="grid gap-2 sm:grid-cols-2">
          <div>
            <label for="harm1a" class="label">
              {$t('harmLevel1')}
              <span class="text-themed-faint font-normal ml-1">— {$t('reducedEffect')}</span>
            </label>
            <input type="text" id="harm1a" value={getHarmArray('harm1')[0] || ''} oninput={(e) => { const c = getHarmArray('harm1'); updateData('harm1', [e.currentTarget.value, c[1]]); }} class="input" />
          </div>
          <div>
            <label for="harm1b" class="label">&nbsp;</label>
            <input type="text" id="harm1b" value={getHarmArray('harm1')[1] || ''} oninput={(e) => { const c = getHarmArray('harm1'); updateData('harm1', [c[0], e.currentTarget.value]); }} class="input" />
          </div>
        </div>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-6">
        <div class="flex flex-wrap gap-4">
          <label class="flex items-center gap-2">
            <input type="checkbox" checked={Boolean(sheet.data.armor)} onchange={(e) => updateData('armor', e.currentTarget.checked)} class="rounded border-themed bg-themed-tertiary text-themed-accent focus:ring-2" />
            <span class="text-themed-secondary">{$t('armor')}</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" checked={Boolean(sheet.data.heavyArmor)} onchange={(e) => updateData('heavyArmor', e.currentTarget.checked)} class="rounded border-themed bg-themed-tertiary text-themed-accent focus:ring-2" />
            <span class="text-themed-secondary">{$t('heavy')}</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" checked={Boolean(sheet.data.specialArmor)} onchange={(e) => updateData('specialArmor', e.currentTarget.checked)} class="rounded border-themed bg-themed-tertiary text-themed-accent focus:ring-2" />
            <span class="text-themed-secondary">{$t('special')}</span>
          </label>
        </div>
        <ClockInput
          label={$t('healingClock')}
          value={Number(sheet.data.healingClock) || 0}
          segments={4}
          onChange={(v) => updateData('healingClock', v)}
        />
      </div>
      </div>
      {/if}
    </section>

    <!-- Coin & Stash -->
    <section class="card">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-themed-primary">{$t('coinAndStash')}</h2>
        <button type="button" onclick={() => toggleSection('coinStash')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['coinStash'] ? '-rotate-90' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
        </button>
      </div>
      {#if !collapsed['coinStash']}
      <div class="mt-4">
      <div class="grid gap-6 sm:grid-cols-2">
        <TrackInput
          label={$t('coin')}
          value={Number(sheet.data.coin) || 0}
          max={4}
          onChange={(v) => updateData('coin', v)}
        />
        <TrackInput
          label={$t('stash')}
          value={Number(sheet.data.stash) || 0}
          max={schema.stash.max}
          onChange={(v) => updateData('stash', v)}
        />
      </div>
      </div>
      {/if}
    </section>
  </div>

  <!-- Right column -->
  <div class="space-y-6">
    <!-- Special Abilities (playbook-dependent) -->
    {#if currentPlaybook}
      <section class="card">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-themed-primary">{$t('specialAbilities')}</h2>
          <div class="flex items-center gap-3">
            <span class="text-xs text-themed-muted">{$t('nextCost')}: {nextAbilityCost} EXP</span>
            <button type="button" onclick={() => toggleSection('specialAbilities')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['specialAbilities'] ? '-rotate-90' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            </button>
          </div>
        </div>
        {#if !collapsed['specialAbilities']}
        <div class="mt-4">
        <div class="space-y-3">
          {#each currentPlaybook.specialAbilities as ability}
            <label class="flex items-start gap-3 p-2 rounded hover:bg-themed-tertiary/50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={selectedAbilities.includes(ability.name)}
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

    <!-- Items & Load -->
    <section class="card">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-themed-primary">{$t('itemsAndLoad')}</h2>
        <button type="button" onclick={() => toggleSection('itemsLoad')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['itemsLoad'] ? '-rotate-90' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
        </button>
      </div>
      {#if !collapsed['itemsLoad']}
      <div class="mt-4">
      <div class="flex flex-wrap items-center gap-4 mb-4">
        <div>
          <label for="loadLevel" class="label">{$t('loadLevel')}</label>
          <select id="loadLevel" value={sheet.data.loadLevel || 'normal'} onchange={(e) => updateData('loadLevel', e.currentTarget.value)} class="input w-auto">
            {#each schema.loadLevels as level}
              <option value={level.value}>{labelFor(level)}</option>
            {/each}
          </select>
        </div>
        <div class="text-sm">
          <span class="label">{$t('currentLoad')}</span>
          <span class="font-bold {totalLoad > getLoadMax() ? 'text-red-400' : 'text-themed-accent'}">{totalLoad}</span>
          <span class="text-themed-muted">/ {getLoadMax()}</span>
        </div>
      </div>

      <!-- Shared Items -->
      <div class="mb-4">
        <h3 class="text-sm font-medium text-themed-accent mb-2 uppercase">{$t('sharedItems')}</h3>
        <div class="grid gap-1">
          {#each schema.sharedItems as item}
            <label class="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-themed-tertiary/50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.name)}
                onchange={() => toggleArrayItem('selectedItems', item.name)}
                class="rounded border-themed bg-themed-tertiary text-themed-accent focus:ring-2"
              />
              <span class="text-themed-secondary">{isEs ? item.name : (item.nameEn || item.name)}</span>
              <span class="text-themed-faint text-xs ml-auto">{item.load}</span>
            </label>
          {/each}
        </div>
      </div>

      <!-- Playbook Items -->
      {#if currentPlaybook}
        <div>
          <h3 class="text-sm font-medium text-themed-accent mb-2 uppercase">{$t('playbookItems')}</h3>
          <div class="grid gap-1">
            {#each currentPlaybook.items as item}
              <label class="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-themed-tertiary/50 cursor-pointer" title={item.description || ''}>
                <input
                  type="checkbox"
                  checked={selectedPlaybookItems.includes(item.name)}
                  onchange={() => toggleArrayItem('selectedPlaybookItems', item.name)}
                  class="rounded border-themed bg-themed-tertiary text-themed-accent focus:ring-2"
                />
                <span class="text-themed-secondary">{isEs ? item.name : (item.nameEn || item.name)}</span>
                <span class="text-themed-faint text-xs ml-auto">{item.load}</span>
              </label>
            {/each}
          </div>
        </div>
      {/if}
      </div>
      {/if}
    </section>
  </div>

  <!-- Friends & Rivals (full width) -->
  <section class="card lg:col-span-2">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-themed-primary">{$t('friendsAndRivals')}</h2>
      <button type="button" onclick={() => toggleSection('friendsRivals')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['friendsRivals'] ? '-rotate-90' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
      </button>
    </div>
    {#if !collapsed['friendsRivals']}
    <div class="mt-4">
    <div class="grid gap-6 sm:grid-cols-2">
      <div>
        <h3 class="text-sm font-medium text-themed-accent mb-2 uppercase">{$t('friends')}</h3>
        <div class="space-y-2">
          {#if currentPlaybook}
            {#each currentPlaybook.friends as contact}
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={getContactStatus(contact.name) === 'friend'}
                  onchange={() => toggleContactStatus(contact.name, 'friend')}
                  class="rounded border-themed bg-themed-tertiary text-themed-accent focus:ring-2"
                />
                <div>
                  <span class="text-themed-primary font-medium">{contact.name}</span>
                  <span class="text-themed-muted ml-1">- {contact.description}</span>
                </div>
              </label>
            {/each}
          {/if}
          {#each customFriends as contact, i}
            <div class="flex items-center gap-2 text-sm group/contact">
              <input
                type="checkbox"
                checked={getContactStatus(contact.name) === 'friend'}
                onchange={() => toggleContactStatus(contact.name, 'friend')}
                class="rounded border-themed bg-themed-tertiary text-themed-accent focus:ring-2"
              />
              <div class="flex-1">
                <span class="text-themed-primary font-medium">{contact.name}</span>
                {#if contact.description}
                  <span class="text-themed-muted ml-1">- {contact.description}</span>
                {/if}
              </div>
              <button
                type="button"
                onclick={() => removeCustomFriend(i)}
                class="text-themed-faint hover:text-red-400 opacity-0 group-hover/contact:opacity-100 transition-opacity text-xs"
              >{$t('remove')}</button>
            </div>
          {/each}
          <div class="flex gap-2 mt-2">
            <input type="text" bind:value={newFriendName} placeholder={$t('contactName')} class="input text-sm flex-1" />
            <input type="text" bind:value={newFriendDesc} placeholder={$t('contactDescription')} class="input text-sm flex-1" />
            <button type="button" onclick={addCustomFriend} class="btn btn-secondary text-xs whitespace-nowrap" disabled={!newFriendName.trim()}>+ {$t('addFriend')}</button>
          </div>
        </div>
      </div>
      <div>
        <h3 class="text-sm font-medium text-red-400 mb-2 uppercase">{$t('rivals')}</h3>
        <div class="space-y-2">
          {#if currentPlaybook}
            {#each currentPlaybook.rivals as contact}
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={getContactStatus(contact.name) === 'rival'}
                  onchange={() => toggleContactStatus(contact.name, 'rival')}
                  class="rounded border-themed bg-themed-tertiary text-red-500 focus:ring-2"
                />
                <div>
                  <span class="text-themed-primary font-medium">{contact.name}</span>
                  <span class="text-themed-muted ml-1">- {contact.description}</span>
                </div>
              </label>
            {/each}
          {/if}
          {#each customRivals as contact, i}
            <div class="flex items-center gap-2 text-sm group/contact">
              <input
                type="checkbox"
                checked={getContactStatus(contact.name) === 'rival'}
                onchange={() => toggleContactStatus(contact.name, 'rival')}
                class="rounded border-themed bg-themed-tertiary text-red-500 focus:ring-2"
              />
              <div class="flex-1">
                <span class="text-themed-primary font-medium">{contact.name}</span>
                {#if contact.description}
                  <span class="text-themed-muted ml-1">- {contact.description}</span>
                {/if}
              </div>
              <button
                type="button"
                onclick={() => removeCustomRival(i)}
                class="text-themed-faint hover:text-red-400 opacity-0 group-hover/contact:opacity-100 transition-opacity text-xs"
              >{$t('remove')}</button>
            </div>
          {/each}
          <div class="flex gap-2 mt-2">
            <input type="text" bind:value={newRivalName} placeholder={$t('contactName')} class="input text-sm flex-1" />
            <input type="text" bind:value={newRivalDesc} placeholder={$t('contactDescription')} class="input text-sm flex-1" />
            <button type="button" onclick={addCustomRival} class="btn btn-secondary text-xs whitespace-nowrap" disabled={!newRivalName.trim()}>+ {$t('addRival')}</button>
          </div>
        </div>
      </div>
    </div>
    </div>
    {/if}
  </section>

  <!-- Custom Clocks -->
  <section class="card lg:col-span-2">
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
            <label for="clock-segments-{i}" class="text-xs text-themed-muted whitespace-nowrap">{$t('segments')}</label>
            <select
              id="clock-segments-{i}"
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

  <!-- Notes -->
  <section class="card lg:col-span-2">
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

  <!-- Gather Info (moved to bottom) -->
  {#if currentPlaybook}
    <section class="card lg:col-span-2">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-themed-primary">{$t('gatherInfo')}</h2>
        <button type="button" onclick={() => toggleSection('gatherInfo')} class="text-themed-muted hover:text-themed-primary transition-transform duration-200 {collapsed['gatherInfo'] ? '-rotate-90' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
        </button>
      </div>
      {#if !collapsed['gatherInfo']}
      <div class="mt-4">
      <ul class="space-y-1">
        {#each currentPlaybook.gatherInfo as question}
          <li class="text-sm text-themed-secondary pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-themed-accent">
            {question}
          </li>
        {/each}
      </ul>
      </div>
      {/if}
    </section>
  {/if}
</div>
</fieldset>
