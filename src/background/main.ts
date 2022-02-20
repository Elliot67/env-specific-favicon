import { sendMessage, onMessage } from 'webext-bridge';
import { baseFavicons, defaultSettings } from '~/configuration/settings';
import { drawFilterOnCanvas, loadImage, SettingsStorage, createCanvasWithImage } from '~/logic';
import { isDef, isNull, isUndefined } from '~/utils';
import { AppDataGlobal, AppDataRule } from '~/types/app';

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client');
  // load latest content script
  import('./contentScriptHMR');
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
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const isCompleteEvent = changeInfo.status === 'complete';
    const isHttpUrl = ['http://', 'https://'].some((s) => tab?.url?.startsWith(s));
    if (isCompleteEvent && isHttpUrl) {
      console.log(changeInfo, tab);
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
      if (isDef(tab.favIconUrl)) {
        console.warn('no favicon found on the tab', tab);
      }

      const match = getMatch({ url: tab.url, title: tab.title });
      if (match === false) {
        console.warn('no match for this tab');
        return;
      }

      const favicon = await getNewFavicon(match, tab.favIconUrl);

      const message = { favicon: favicon };
      sendMessage('update-favicon', message, `content-script@${tabId}`);
      console.log('send message from background script', message);
    } catch (e) {
      console.warn('error while retrieving tab informations/generating the favicon', e);
    }
  }

  function getMatch(prop: { url: string | undefined; title: string | undefined }): AppDataRule | false {
    if (isUndefined(prop.url) && isUndefined(prop.title)) {
      return false;
    }

    for (const rule of SETTINGS.rules) {
      if (!rule.active) {
        continue;
      }

      const value = prop[rule.type];
      if (isUndefined(value)) {
        continue;
      }

      const regex = new RegExp(`/${rule.testPattern}/`);
      if (regex.test(value)) {
        return rule;
      }
    }

    return false;
  }

  function getFallbackFavicon(): string {
    const type = SETTINGS.favicon.type;
    if (type === 'custom') {
      return SETTINGS.favicon.custom.length > 0 ? SETTINGS.favicon.custom : baseFavicons[defaultSettings.favicon.type];
    } else {
      return baseFavicons[type];
    }
  }

  async function getNewFavicon(item: AppDataRule, url?: string): Promise<string> {
    if (!isDef(url)) {
      url = getFallbackFavicon();
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
