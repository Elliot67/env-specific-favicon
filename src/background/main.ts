import { sendMessage, onMessage } from 'webext-bridge';
import { blankFavicons } from '~/configuration/settings';
import { drawFilterOnCanvas, loadImage, SettingsStorage, createCanvasWithImage } from '~/logic';
import { isNull, isUndefined } from '~/utils';
import { AppDataGlobal, AppDataRule } from '~/types/app';

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client');
}

browser.runtime.onInstalled.addListener((): void => {
  browser.runtime.openOptionsPage();
});

let SETTINGS: AppDataGlobal;

browser.storage.onChanged.addListener((changes, areaName) => {
  const newSettings = SettingsStorage.getNewSettingsFromChange(changes, areaName);
  if (isNull(newSettings)) {
    return;
  }
  SETTINGS = newSettings;
});

SettingsStorage.getItem().then((storeSettings) => {
  SETTINGS = storeSettings;
  run();
});

function run() {
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
      await manageTabUpdate(tabId);
    }
  });

  // Generate favicon for Options page
  onMessage('get-favicon', async ({ data }) => {
    const rule = data as unknown as AppDataRule;
    return { favicon: await getNewFavicon(rule) };
  });

  async function manageTabUpdate(tabId: number) {
    try {
      const tab = await browser.tabs.get(tabId);
      console.log(tab.url);

      const match = getMatch({ url: tab.url, title: tab.title });
      if (match === false) {
        console.log('no match for this tab');
        return;
      }

      const favicon = await getNewFavicon(match, tab.favIconUrl);
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

    for (const item of SETTINGS.rules) {
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

  async function getNewFavicon(item: AppDataRule, url?: string): Promise<string> {
    if (isUndefined(url)) {
      url = blankFavicons[SETTINGS.blankFavicon];
    }

    const $img = await loadImage(url);
    const drawingParams = createCanvasWithImage($img);
    if (isNull(drawingParams)) {
      console.warn('fallback on the default favicon');
      return url;
    }
    const { $canvas, ctx } = drawingParams;
    drawFilterOnCanvas($canvas, ctx, item.color, item.filter);
    return $canvas.toDataURL('image/png');
  }
}
