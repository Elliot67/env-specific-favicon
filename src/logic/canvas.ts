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
    $img.src = imageUrl;
  });
}

export function createCanvasWithImage($img: HTMLImageElement): {
  $canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} | null {
  const $canvas = document.createElement('canvas');
  $canvas.width = $img.width;
  $canvas.height = $img.height;
  const ctx = $canvas.getContext('2d');
  if (isNull(ctx)) {
    console.warn('Error, could not get canvas context');
    return null;
  }
  ctx.drawImage($img, 0, 0);
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
  ctx.fillStyle = color;

  switch (filter) {
    case 'top':
      ctx.fillRect(0, 0, width, Math.floor(height / 4));
      return;
    case 'right':
      ctx.fillRect(Math.floor(width * 0.75), 0, Math.floor(width / 4), height);
      return;
    case 'bottom':
      ctx.fillRect(0, Math.floor(height * 0.75), width, Math.floor(height / 4));
      return;
    case 'left':
      ctx.fillRect(0, 0, Math.floor(width / 4), height);
      return;
    /*
      case 'cover':
        ctx.globalAlpha = 0.5;
        ctx.fillRect(0, 0, width, height);
        return;
      case 'replace':
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillRect(0, 0, width, height);
        return;
      case 'background':
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillRect(0, 0, width, height);
        return;
      case 'xor-top':
        ctx.globalCompositeOperation = 'xor';
        ctx.fillRect(0, 0, width, Math.floor(height / 4));
        return;
      */
  }
}
