<script lang="ts">
  import { t } from '$lib/i18n';

  let { imageUrl, naturalWidth, naturalHeight, onConfirm, onCancel }: {
    imageUrl: string;
    naturalWidth: number;
    naturalHeight: number;
    onConfirm: (crop: { x: number; y: number; size: number }) => void;
    onCancel: () => void;
  } = $props();

  const MIN_CROP_SIZE = 50;

  let imgEl: HTMLImageElement | undefined = $state();
  let displayW = $state(0);
  let displayH = $state(0);
  let ready = $state(false);
  let scale = $derived(displayW > 0 ? naturalWidth / displayW : 1);

  let cropX = $state(0);
  let cropY = $state(0);
  let cropSize = $state(0);
  let maxCropSize = $derived(Math.min(displayW, displayH));

  let dragging: 'move' | null = $state(null);
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartCropX = 0;
  let dragStartCropY = 0;

  function clamp(val: number, min: number, max: number) {
    return Math.min(max, Math.max(min, val));
  }

  function handleImgLoad() {
    if (!imgEl) return;
    displayW = imgEl.clientWidth;
    displayH = imgEl.clientHeight;
    const size = Math.min(displayW, displayH);
    cropSize = size;
    cropX = (displayW - size) / 2;
    cropY = (displayH - size) / 2;
    ready = true;
  }

  function startMove(e: PointerEvent) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragging = 'move';
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartCropX = cropX;
    dragStartCropY = cropY;
  }

  function handlePointerMove(e: PointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    cropX = clamp(dragStartCropX + dx, 0, displayW - cropSize);
    cropY = clamp(dragStartCropY + dy, 0, displayH - cropSize);
  }

  function handlePointerUp() {
    dragging = null;
  }

  function handleSlider(e: Event) {
    cropSize = Number((e.currentTarget as HTMLInputElement).value);
    cropX = clamp(cropX, 0, displayW - cropSize);
    cropY = clamp(cropY, 0, displayH - cropSize);
  }

  function handleConfirm() {
    onConfirm({
      x: Math.round(cropX * scale),
      y: Math.round(cropY * scale),
      size: Math.round(cropSize * scale)
    });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onCancel();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onCancel();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
  onclick={handleBackdropClick}
>
  <div class="bg-gray-900 rounded-lg p-4 flex flex-col gap-4 max-w-[90vw] max-h-[90vh]">
    <h3 class="text-lg font-semibold text-themed-primary">{$t('cropImage')}</h3>

    <div class="relative inline-block mx-auto select-none touch-none">
      <img
        bind:this={imgEl}
        src={imageUrl}
        alt=""
        onload={handleImgLoad}
        class="block max-w-[min(500px,80vw)] max-h-[60vh]"
        draggable="false"
      />

      {#if ready}
        <div
          class="absolute border-2 border-white/90 cursor-move"
          style="left:{cropX}px; top:{cropY}px; width:{cropSize}px; height:{cropSize}px; box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);"
          onpointerdown={startMove}
          onpointermove={handlePointerMove}
          onpointerup={handlePointerUp}
        >
          <!-- Corner brackets -->
          <div class="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white"></div>
          <div class="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white"></div>
          <div class="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white"></div>
          <div class="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white"></div>
        </div>
      {/if}
    </div>

    {#if ready}
      <div class="flex items-center gap-3 px-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-themed-muted flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
        </svg>
        <input
          type="range"
          min={MIN_CROP_SIZE}
          max={maxCropSize}
          value={cropSize}
          oninput={handleSlider}
          class="flex-1"
        />
      </div>
    {/if}

    <div class="flex justify-end gap-3">
      <button type="button" onclick={onCancel} class="btn btn-secondary text-sm">
        {$t('cancel')}
      </button>
      <button type="button" onclick={handleConfirm} class="btn btn-secondary text-sm !text-themed-accent !border-themed-accent">
        {$t('cropConfirm')}
      </button>
    </div>
  </div>
</div>
