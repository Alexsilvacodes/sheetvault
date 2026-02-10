<script lang="ts">
  let { value = 0, max, label, onChange }: { value?: number; max: number; label: string; onChange: (value: number) => void } = $props();

  function handleClick(index: number) {
    const newValue = index === value ? index - 1 : index;
    onChange(Math.max(0, newValue));
  }
</script>

<div class="space-y-1">
  <span class="text-sm text-themed-secondary">{label}</span>
  <div class="flex gap-1 flex-wrap">
    {#each Array(max) as _, i}
      <button
        type="button"
        onclick={() => handleClick(i + 1)}
        class="track-box {i < value ? 'filled' : ''}"
        aria-label="{label} {i + 1} of {max}"
      >
        {i + 1}
      </button>
    {/each}
  </div>
</div>
