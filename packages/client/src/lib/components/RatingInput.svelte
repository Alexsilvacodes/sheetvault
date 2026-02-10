<script lang="ts">
  let { value = 0, max = 4, label, onChange, splitFirst = false }: { value?: number; max?: number; label: string; onChange: (value: number) => void; splitFirst?: boolean } = $props();

  function handleClick(index: number) {
    const newValue = index === value ? index - 1 : index;
    onChange(Math.max(0, newValue));
  }
</script>

<div class="flex items-center gap-2">
  <span class="text-sm text-themed-secondary w-20">{label}</span>
  <div class="flex gap-1">
    {#each Array(max) as _, i}
      {#if splitFirst && i === 1}
        <span class="rating-separator"></span>
      {/if}
      <button
        type="button"
        onclick={() => handleClick(i + 1)}
        class="rating-dot {i < value ? 'filled' : ''}"
        aria-label="{label} rating {i + 1}"
      ></button>
    {/each}
  </div>
</div>
