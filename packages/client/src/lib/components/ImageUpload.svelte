<script lang="ts">
  import { api } from '$lib/api';
  import { validateImageFile, loadImage, cropAndResize, type CropRect } from '$lib/imageUtils';
  import { t } from '$lib/i18n';
  import ImageCropModal from './ImageCropModal.svelte';

  let { sheetId, userId, currentImage = undefined, readonly = false, onImageChange }: {
    sheetId: string;
    userId: string;
    currentImage?: string | undefined;
    readonly?: boolean;
    onImageChange: (filename: string | null) => void;
  } = $props();

  let uploading = $state(false);
  let previewUrl = $derived(currentImage ? api.getImageUrl(currentImage) : null);
  let fileInput: HTMLInputElement | undefined = $state();

  // Crop modal state
  let showCrop = $state(false);
  let cropImageUrl = $state<string | null>(null);
  let cropImageEl = $state<HTMLImageElement | null>(null);

  // Lightbox state
  let showLightbox = $state(false);

  function openFilePicker() {
    fileInput?.click();
  }

  async function handleFileSelect(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    const error = validateImageFile(file);
    if (error) {
      alert($t(error as 'invalidImageType' | 'imageTooLarge'));
      return;
    }

    try {
      const { img, url } = await loadImage(file);

      if (img.width === img.height) {
        // Already square — skip crop, upload directly
        URL.revokeObjectURL(url);
        await uploadCropped(img, { x: 0, y: 0, size: img.width });
      } else {
        // Show crop modal
        cropImageEl = img;
        cropImageUrl = url;
        showCrop = true;
      }
    } catch (err) {
      console.error('Failed to load image:', err);
    }
  }

  async function handleCropConfirm(crop: CropRect) {
    showCrop = false;
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    const img = cropImageEl!;
    cropImageEl = null;
    cropImageUrl = null;
    await uploadCropped(img, crop);
  }

  function handleCropCancel() {
    showCrop = false;
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    cropImageEl = null;
    cropImageUrl = null;
  }

  async function uploadCropped(img: HTMLImageElement, crop: CropRect) {
    uploading = true;
    try {
      const { blob } = await cropAndResize(img, crop);
      const result = await api.uploadSheetImage(sheetId, blob, userId);
      onImageChange(result.image);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      uploading = false;
    }
  }

  async function handleRemove() {
    uploading = true;
    try {
      await api.deleteSheetImage(sheetId, userId);
      onImageChange(null);
    } catch (err) {
      console.error('Remove failed:', err);
    } finally {
      uploading = false;
    }
  }

  function openLightbox() {
    if (previewUrl) showLightbox = true;
  }

  function closeLightbox() {
    showLightbox = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && showLightbox) closeLightbox();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex flex-col items-center gap-2">
  <!-- Preview -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="relative w-32 h-32 rounded-full overflow-hidden bg-themed-tertiary border-2 border-themed flex items-center justify-center {previewUrl ? 'cursor-pointer' : ''}"
    onclick={previewUrl ? openLightbox : undefined}
    onkeydown={previewUrl ? (e) => { if (e.key === 'Enter') openLightbox(); } : undefined}
    role={previewUrl ? 'button' : undefined}
    tabindex={previewUrl ? 0 : undefined}
  >
    {#if previewUrl}
      <img src={previewUrl} alt="" class="w-full h-full object-cover" />
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-themed-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    {/if}

    {#if uploading}
      <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
        <span class="text-xs text-white font-medium">{$t('uploading')}</span>
      </div>
    {/if}
  </div>

  <!-- Controls -->
  {#if !readonly}
    <input
      bind:this={fileInput}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="hidden"
      onchange={handleFileSelect}
    />
    <div class="flex gap-1">
      {#if currentImage}
        <button
          type="button"
          onclick={openFilePicker}
          disabled={uploading}
          class="p-1 text-themed-muted hover:text-themed-accent transition-colors"
          title={$t('changeImage')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        </button>
        <button
          type="button"
          onclick={handleRemove}
          disabled={uploading}
          class="p-1 text-themed-muted hover:text-red-400 transition-colors"
          title={$t('removeImage')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
      {:else}
        <button
          type="button"
          onclick={openFilePicker}
          disabled={uploading}
          class="text-xs text-themed-accent hover:text-themed-primary transition-colors"
        >
          {$t('uploadImage')}
        </button>
      {/if}
    </div>
  {/if}
</div>

<!-- Crop Modal -->
{#if showCrop && cropImageUrl && cropImageEl}
  <ImageCropModal
    imageUrl={cropImageUrl}
    naturalWidth={cropImageEl.naturalWidth}
    naturalHeight={cropImageEl.naturalHeight}
    onConfirm={handleCropConfirm}
    onCancel={handleCropCancel}
  />
{/if}

<!-- Lightbox -->
{#if showLightbox && previewUrl}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
    onclick={closeLightbox}
  >
    <button
      type="button"
      onclick={closeLightbox}
      class="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
      aria-label={$t('close')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <img
      src={previewUrl}
      alt=""
      class="max-w-[90vw] max-h-[90vh] rounded-lg object-contain"
      onclick={(e) => e.stopPropagation()}
    />
  </div>
{/if}
