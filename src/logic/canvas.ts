import { AppDataRule } from '~/types/app';
import { isNull } from '~/utils';

export async function loadImage(imageUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const $img = document.createElement('img');
    $img.addEventListener(
      'load',
      () => {
        return resolve($img);
      },
      { passive: true }
    );
    $img.addEventListener('error', (e) => {
      return reject(e);
    });
    $img.src = imageUrl;
  });
}

export function createCanvasWithImage($img: HTMLImageElement): {
  $canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} | null {
  let imgWidth = $img.width;
  let imgHeight = $img.height;

  // Resize image with a max size boundary
  const MAX_IMG_DIMENSION = 512;
  if (imgWidth > MAX_IMG_DIMENSION || imgHeight > MAX_IMG_DIMENSION) {
    const scaleRatio = Math.max(imgWidth / MAX_IMG_DIMENSION, imgHeight / MAX_IMG_DIMENSION);
    imgWidth = imgWidth / scaleRatio;
    imgHeight = imgHeight / scaleRatio;
  }

  const $canvas = document.createElement('canvas');
  $canvas.width = imgWidth;
  $canvas.height = imgHeight;
  const ctx = $canvas.getContext('2d');
  if (isNull(ctx)) {
    console.warn('Error, could not get canvas context');
    return null;
  }

  ctx.drawImage($img, 0, 0, imgWidth, imgHeight);
  return { $canvas, ctx };
}

export function drawFilterOnCanvas(
  $canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  color: string,
  filter: AppDataRule['filter']
): void {
  const width = $canvas.width;
  const height = $canvas.height;

  switch (filter) {
    case 'top':
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, Math.floor(height / 4));
      return;
    case 'bottom':
      ctx.fillStyle = color;
      ctx.fillRect(0, Math.floor(height * 0.75), width, Math.floor(height / 4));
      return;
    case 'cover':
      ctx.fillStyle = color + 'B3';
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillRect(0, 0, width, height);
      return;
    case 'fill':
      ctx.fillStyle = color;
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillRect(0, 0, width, height);
      return;
  }
}
