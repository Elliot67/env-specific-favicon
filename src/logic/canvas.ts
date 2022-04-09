import { AppDataRule } from '~/types/app';
import { isNull, isString } from '~/utils';

export async function loadImage(imageUrl: string): Promise<ImageBitmap> {
  return fetch(imageUrl)
    .then((response) => response.blob())
    .then((blob) => createImageBitmap(blob))
    .then((bitmap) => bitmap);
}

export function createCanvasWithImage(img: ImageBitmap): {
  canvas: OffscreenCanvas;
  ctx: OffscreenCanvasRenderingContext2D;
} | null {
  let imgWidth = img.width;
  let imgHeight = img.height;

  // Resize image with a max size boundary
  const MAX_IMG_DIMENSION = 512;
  if (imgWidth > MAX_IMG_DIMENSION || imgHeight > MAX_IMG_DIMENSION) {
    const scaleRatio = Math.max(imgWidth / MAX_IMG_DIMENSION, imgHeight / MAX_IMG_DIMENSION);
    imgWidth = imgWidth / scaleRatio;
    imgHeight = imgHeight / scaleRatio;
  }

  const canvas = new OffscreenCanvas(imgWidth, imgHeight);
  canvas.width = imgWidth;
  canvas.height = imgHeight;
  const ctx = canvas.getContext('2d');
  if (isNull(ctx)) {
    console.warn('Error, could not get canvas context');
    return null;
  }

  ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
  return { canvas, ctx };
}

export function drawFilterOnCanvas(
  canvas: OffscreenCanvas,
  ctx: OffscreenCanvasRenderingContext2D,
  color: string,
  filter: AppDataRule['filter']
): void {
  const width = canvas.width;
  const height = canvas.height;

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

export async function canvaToDataURL(canvas: OffscreenCanvas): Promise<string> {
  return await canvas.convertToBlob({ type: 'image/png' }).then((blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        isString(reader.result)
          ? resolve(reader.result)
          : reject('Could export the canvas image. Reader result invalid.');
      });
      reader.addEventListener('abort error', () => {
        reject('Could export the canvas image.');
      });
      reader.readAsDataURL(blob);
    });
  });
}
