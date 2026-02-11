const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB (raw input limit before processing)
const OUTPUT_SIZE = 512;
const OUTPUT_QUALITY = 0.85;

export interface CropRect {
  x: number;
  y: number;
  size: number;
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'invalidImageType';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'imageTooLarge';
  }
  return null;
}

export function loadImage(file: File): Promise<{ img: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

export function cropAndResize(img: HTMLImageElement, crop: CropRect): Promise<{ blob: Blob }> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(img, crop.x, crop.y, crop.size, crop.size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({ blob });
        } else {
          reject(new Error('Failed to process image'));
        }
      },
      'image/jpeg',
      OUTPUT_QUALITY
    );
  });
}
