<script lang="ts">
  let { value = 0, segments = 4, label, onChange, size = 48 }: { value?: number; segments?: number; label: string; onChange: (value: number) => void; size?: number } = $props();

  let radius = $derived(size / 2 - 2);
  let center = $derived(size / 2);

  function getPath(index: number): string {
    const startAngle = (index / segments) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((index + 1) / segments) * 2 * Math.PI - Math.PI / 2;
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);
    const largeArc = segments <= 2 ? 1 : 0;
    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  function handleClick(index: number) {
    const newValue = index + 1 === value ? index : index + 1;
    onChange(Math.max(0, newValue));
  }
</script>

<div class="flex items-center gap-3">
  <svg width={size} height={size} class="cursor-pointer">
    <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--color-text-faint)" stroke-width="2" />
    {#each Array(segments) as _, i}
      <path
        d={getPath(i)}
        fill={i < value ? 'var(--color-accent)' : 'transparent'}
        stroke="var(--color-text-faint)"
        stroke-width="1"
        onclick={() => handleClick(i)}
        role="button"
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && handleClick(i)}
      />
    {/each}
  </svg>
  <span class="text-sm text-themed-secondary">{label}</span>
</div>
