import { onMessage } from 'webext-bridge';
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
  // Generate favicon for Options page
  onMessage('get-favicon', async ({ data }) => {
    const rule = data as unknown as AppDataRule;
    return { favicon: await getNewFavicon(rule) };
  });

  // Generate favicon for the content script
  onMessage('get-favicon-from-links', async ({ data: links, sender }) => {
    const tab = await browser.tabs.get(sender.tabId);
    const match = getMatch({ url: tab.url, title: tab.title });
    if (match === false) {
      console.warn('no match for this tab');
      return null;
    }

    // Add fallback icon
    links.push('');

    for (const link of links) {
      try {
        const favicon = await getNewFavicon(match, link);
        return { favicon };
      } catch (e) {
        console.warn('error while genereting the favicon with this link, trying the next link', e);
      }
    }

    console.warn('could not generate the favicon with any of the links', links);
    return null;
  });

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
    let type = SETTINGS.favicon.type;
    if (type === 'custom') {
      if (SETTINGS.favicon.custom.length > 0) {
        return SETTINGS.favicon.custom;
      } else {
        type = defaultSettings.favicon.type as 'earth'; // FIXME: Let typescript type with the value
      }
    }

    const themeSuffix = window?.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    return baseFavicons[`${type}_${themeSuffix}`];
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
