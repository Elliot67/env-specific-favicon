import { sendMessage, onMessage } from 'webext-bridge';
import { Manifest } from 'webextension-polyfill';
import { isNull, isUndefined } from '~/logic/utils';

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client');
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed');
});

// TODO: Mettre ça autre part
interface AppDataGlobal {
  version: string;
  blankFavIcon: 'chrome' | 'edge' | 'firefox'; // TODO: Récupérer avec chrome://favicon/ | edge://favicon/
  tabs: AppDataItem[];
}

interface AppDataItem {
  id: string;
  active: boolean;
  type: 'url' | 'title';
  testPattern: string;
  filter: 'top'; // TODO: Add more
  color: string;
}

browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  console.log('BROWSER ON UPDATED', tabId, changeInfo);

  if (changeInfo.status === 'complete') {
    await manageTabUpdate(tabId);
  }
});

async function manageTabUpdate(tabId: number) {
  try {
    const tab = await browser.tabs.get(tabId);
    console.log(tab.url);
    // Check if it matches what is in local storage

    const match = getMatch({ url: tab.url, title: tab.title });
    if (match === false) {
      console.log('no match for this tab');
      return;
    }

    const favicon = await generateFavicon(match, tab.favIconUrl);
    sendMessage('update-favicon', { favicon: favicon }, `content-script@${tabId}`);
    console.log('just sended a message with ', favicon);
  } catch (e) {
    console.warn('error while retrieving tab informations', e);
  }
}

function getMatch(prop: { url: string | undefined; title: string | undefined }): AppDataItem | false {
  if (isUndefined(prop.url) && isUndefined(prop.title)) {
    return false;
  }

  const activeLocalStorage: AppDataItem[] = [
    {
      active: true,
      type: 'url',
      testPattern: '*',
      filter: 'top',
      color: 'red',
    },
  ]; // TODO: Stocker les données à un endroit pour éviter de devoir les récupérer à chaque fois

  for (const item of activeLocalStorage) {
    const value = prop[item.type];
    if (isUndefined(value)) {
      continue;
    }

    const regex = new RegExp(`/${item.testPattern}/`);
    if (regex.test(value)) {
      return item;
    }
  }

  return false;
}

function generateFavicon(item: AppDataItem, url: string | undefined): Promise<string> {
  return new Promise((resolve, reject) => {
    console.error('THE URL', url);

    if (isUndefined(url)) {
      console.log('getting blank favicon');
      url = getBlankFavicon();
    }

    const $img = document.createElement('img');
    $img.addEventListener(
      'load',
      () => {
        const $canvas = document.createElement('canvas');
        $canvas.width = $img.width;
        $canvas.height = $img.height;
        const context = $canvas.getContext('2d');
        if (isNull(context)) {
          console.warn('Error, could not get canvas context');
          return;
        }
        context.drawImage($img, 0, 0);
        drawOnCanvas(context, item.color, item.filter, $img.width, $img.height);
        const favicon = $canvas.toDataURL();
        resolve(favicon);
      },
      { passive: true }
    );
    $img.src = url;
  });
}

function drawOnCanvas(
  ctx: CanvasRenderingContext2D,
  color: string,
  filter: AppDataItem['filter'],
  width: number,
  height: number
): void {
  ctx.fillStyle = color;

  switch (filter) {
    case 'top':
      ctx.fillRect(0, 0, width, Math.floor(height / 4));
      return;
    /*
    case 'right':
      ctx.fillRect(Math.floor(width * 0.75), 0, Math.floor(width / 4), height);
      return;
    case 'bottom':
      ctx.fillRect(0, Math.floor(height * 0.75), width, Math.floor(height / 4));
      return;
    case 'left':
      ctx.fillRect(0, 0, Math.floor(width / 4), height);
      return;
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

function getBlankFavicon(): string {
  // TODO: Stocker les données à un endroit pour éciter de devoir les récupérer à chaque fois
  const appDataGlobal: AppDataGlobal = {
    version: '1.0',
    blankFavIcon: 'chrome',
    tabs: [],
  };

  // TODO: Move somewhere else
  const themes = {
    chrome: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMAAwICAgICAwICAgMDAwMEBgQEBAQECAYGBQYJCAoKCQgJCQoMDwwKCw4LCQkNEQ0ODxAQERAKDBITEhATDxAQEP/bAEMBAwMDBAMECAQECBALCQsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/AABEIABAAEAMBIgACEQEDEQH/xAAWAAEBAQAAAAAAAAAAAAAAAAAHAwj/xAAgEAABBAIDAQEBAAAAAAAAAAABAgMEBQYHERIhCCIx/8QAFAEBAAAAAAAAAAAAAAAAAAAAA//EABYRAAMAAAAAAAAAAAAAAAAAAAARIf/aAAwDAQACEQMRAD8AxjjVRgupK/B4Nxj2M3GXZ5Fj2j0/J0F6ppK2QvhlRZ5SHHClKlqUojrwAOQeS0/QnzXrfJNQO7N17GpYdpUVgsXJNK0livso7aO7yktIJQn8haklPvgSSf6I6G+ocZtNNMa+uLHHK3KaKvRXxG8ifMesnR2+qEdneCEkN8JKT6SOR4T1HLa/x3TWH5TVQ9gVWUZJlsORVxa6imOSqejr5C+z5S4eEqcUkBCQkAp4JJIPqxB1n//Z`,
    edge: `data:image/png,base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAJJJREFUOE/t0+ENQTEYheHnbsAGjGAEk2AEEzCCEa5JjMIGbEA+uaWqkfor+qftyemb5uR8nedaYIdRpqVj6OuKrsvEI+Y4FcYr9oh9VUJyQBjye/Imva9BvgEE8A3SChjjMnzpBdIC2GJTCfD+tgVQC/+R1x/wcyGeMasMU9mDCQ6YlkVaDo0Lw6cVlY7Rjkq7AVm+LBEDT3/PAAAAAElFTkSuQmCC`,
    firefox: ``, // TODO: get Firefox one
  };

  return themes[appDataGlobal.blankFavIcon];
}
