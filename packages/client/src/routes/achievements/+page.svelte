<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { isLoggedIn } from '$lib/stores';
  import { t } from '$lib/i18n';

  interface Achievement {
    filename: string;
    title: string;
    author: string;
  }

  let achievements = $state<Achievement[]>([]);
  let error = $state(false);

  let lightboxOpen = $state(false);
  let lightboxIndex = $state(0);

  function parseFilename(filename: string): { title: string; author: string } {
    const base = filename.replace(/\.jpe?g$/i, '');
    const sep = base.indexOf(' - ');
    if (sep === -1) return { title: base, author: '' };
    return { title: base.slice(0, sep).trim(), author: base.slice(sep + 3).trim() };
  }

  function openLightbox(index: number) {
    lightboxIndex = index;
    lightboxOpen = true;
  }

  function closeLightbox() {
    lightboxOpen = false;
  }

  function prev() {
    lightboxIndex = (lightboxIndex - 1 + achievements.length) % achievements.length;
  }

  function next() {
    lightboxIndex = (lightboxIndex + 1) % achievements.length;
  }

  function onKeydown(e: KeyboardEvent) {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  }

  let uniqueAuthors = $derived(
    [...new Set(achievements.map(a => a.author).filter(Boolean))].join(' · ')
  );

  let current = $derived(achievements[lightboxIndex]);

  onMount(async () => {
    if (!$isLoggedIn) {
      goto('/');
      return;
    }

    try {
      const res = await fetch('/achievements.json');
      const filenames: string[] = await res.json();
      achievements = filenames.map(f => ({ filename: f, ...parseFilename(f) }));
    } catch {
      error = true;
    }
  });
</script>

<svelte:window onkeydown={onKeydown} />

<div class="max-w-6xl mx-auto px-4 py-8">
  <!-- Header -->
  <div class="text-center pb-6 mb-8 border-b border-themed">
    <h1 class="text-2xl font-bold tracking-widest uppercase text-themed-accent">
      {$t('achievementsTitle')}
    </h1>
    {#if uniqueAuthors}
      <p class="text-themed-muted text-xs tracking-widest uppercase mt-2">{uniqueAuthors}</p>
    {/if}
  </div>

  <!-- States -->
  {#if error}
    <p class="text-center text-themed-muted py-16">{$t('achievementsError')}</p>
  {:else if achievements.length === 0}
    <p class="text-center text-themed-muted py-16">{$t('achievementsEmpty')}</p>
  {:else}
    <!-- Grid -->
    <div class="achievements-grid">
      {#each achievements as achievement, i}
        <button
          class="achievement-card"
          onclick={() => openLightbox(i)}
          aria-label={achievement.title}
        >
          <img
            src="/achievements/{encodeURI(achievement.filename)}"
            alt={achievement.title}
            loading="lazy"
          />
          <div class="achievement-overlay">
            <div class="achievement-title">{achievement.title}</div>
            {#if achievement.author}
              <div class="achievement-author">{achievement.author}</div>
            {/if}
          </div>
        </button>
      {/each}
    </div>

    <p class="text-center text-themed-faint text-xs tracking-widest uppercase mt-8">
      — {achievements.length} {$t('achievements').toLowerCase()} —
    </p>
  {/if}
</div>

<!-- Lightbox -->
{#if lightboxOpen && current}
  <div
    class="lightbox-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="lightbox-title"
    tabindex="-1"
    onclick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}
    onkeydown={(e) => { if (e.key === 'Escape') closeLightbox(); }}
  >
    <div class="lightbox-content">
      <button class="lightbox-close" onclick={closeLightbox} aria-label={$t('close')}>
        ✕ {$t('close')}
      </button>

      <img
        src="/achievements/{encodeURI(current.filename)}"
        alt={current.title}
        class="lightbox-img"
      />

      <div id="lightbox-title" class="lightbox-title">{current.title}</div>
      {#if current.author}
        <div class="lightbox-author">— {current.author} —</div>
      {/if}
      <div class="lightbox-counter">{lightboxIndex + 1} / {achievements.length}</div>

      <div class="lightbox-nav">
        <button class="lightbox-nav-btn" onclick={prev} aria-label={$t('previous')}>
          ← {$t('previous')}
        </button>
        <button class="lightbox-nav-btn" onclick={next} aria-label={$t('next')}>
          {$t('next')} →
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  @media (max-width: 768px) {
    .achievements-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 480px) {
    .achievements-grid { grid-template-columns: 1fr; }
  }

  .achievement-card {
    position: relative;
    aspect-ratio: 1;
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s;
    padding: 0;
  }

  .achievement-card:hover {
    border-color: var(--color-accent);
  }

  .achievement-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .achievement-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
    padding: 28px 12px 12px;
  }

  .achievement-title {
    font-size: 12px;
    font-weight: bold;
    color: var(--color-text-primary);
    line-height: 1.3;
    text-align: left;
  }

  .achievement-author {
    font-size: 11px;
    color: var(--color-accent-light);
    margin-top: 2px;
    text-align: left;
  }

  /* Lightbox */
  .lightbox-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.92);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .lightbox-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 700px;
    width: 100%;
  }

  .lightbox-close {
    position: absolute;
    top: -36px;
    right: 0;
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: 13px;
    cursor: pointer;
    letter-spacing: 1px;
    padding: 8px 12px;
    transition: color 0.2s;
    font-family: inherit;
  }

  .lightbox-close:hover {
    color: var(--color-accent-light);
  }

  .lightbox-img {
    max-width: 90vw;
    max-height: 70vh;
    object-fit: contain;
    border: 1px solid var(--color-border);
    border-radius: 6px;
  }

  .lightbox-title {
    font-size: 20px;
    font-weight: bold;
    color: var(--color-text-primary);
    letter-spacing: 1px;
    margin-top: 16px;
    text-align: center;
  }

  .lightbox-author {
    font-size: 13px;
    color: var(--color-accent-light);
    letter-spacing: 2px;
    margin-top: 4px;
    text-align: center;
  }

  .lightbox-counter {
    font-size: 11px;
    color: var(--color-text-muted);
    letter-spacing: 2px;
    margin-top: 8px;
    text-align: center;
  }

  .lightbox-nav {
    display: flex;
    gap: 12px;
    margin-top: 16px;
  }

  .lightbox-nav-btn {
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    color: var(--color-text-muted);
    font-size: 13px;
    padding: 8px 20px;
    cursor: pointer;
    letter-spacing: 1px;
    transition: color 0.2s, border-color 0.2s;
    font-family: inherit;
  }

  .lightbox-nav-btn:hover {
    color: var(--color-accent-light);
    border-color: var(--color-accent);
  }
</style>
