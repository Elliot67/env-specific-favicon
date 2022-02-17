import { sendMessage, onMessage } from 'webext-bridge';
import useSettings from '~/composables/useSettings';
import { blankFavicons } from '~/configuration/settings';
import { isNull, isUndefined } from '~/logic/utils';
import { AppDataRule } from '~/types/app';

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client');
}

browser.runtime.onInstalled.addListener((): void => {
  browser.runtime.openOptionsPage();
});

const { settings, load } = useSettings();
load();

browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    await manageTabUpdate(tabId);
  }
});

// Generate favicon for Options page
onMessage('get-favicon', async ({ data }) => {
  const rule = data as unknown as AppDataRule;
  return { favicon: await generateFavicon(rule) };
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
    console.warn('error while retrieving tab informations or while generating the favicon', e);
  }
}

function getMatch(prop: { url: string | undefined; title: string | undefined }): AppDataRule | false {
  if (isUndefined(prop.url) && isUndefined(prop.title)) {
    return false;
  }

  for (const item of settings.rules) {
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

function generateFavicon(item: AppDataRule, url?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (isUndefined(url)) {
      url = blankFavicons[settings.blankFavicon];
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
          return reject();
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
  filter: AppDataRule['filter'],
  width: number,
  height: number
): void {
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
