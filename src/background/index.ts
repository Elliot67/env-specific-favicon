import browser from 'webextension-polyfill';
import { onMessage } from 'webext-bridge';
import { baseFavicons, defaultSettings } from '~/configuration/settings';
import { drawFilterOnCanvas, loadImage, SettingsStorage, createCanvasWithImage, canvaToDataURL } from '~/logic';
import { isNull, isUndefined } from '~/utils';
import { AppDataGlobal, AppDataRule } from '~/types/app';

browser.runtime.onInstalled.addListener((event): void => {
  if (event.reason === 'install') {
    browser.runtime.openOptionsPage();
  }
});

// Generate favicon for Options page
onMessage('get-favicon', async ({ data }) => {
  const rule = data as unknown as AppDataRule;
  const SETTINGS = await SettingsStorage.getItem();
  return { favicon: await getNewFavicon(SETTINGS, rule) };
});

// Generate favicon for the content script
onMessage('get-favicon-from-links', async ({ data: links, sender }) => {
  const tab = await browser.tabs.get(sender.tabId);
  const SETTINGS = await SettingsStorage.getItem();
  const match = getMatch(SETTINGS, { url: tab.url, title: tab.title });
  if (match === false) {
    console.warn('no match for this tab');
    return null;
  }

  links.push('FALLBACK_FAVICON');

  for (const link of links) {
    try {
      const favicon = await getNewFavicon(SETTINGS, match, link);
      return { favicon };
    } catch (e) {
      console.warn('error while genereting the favicon with this link, trying the next link', e);
    }
  }

  console.warn('Unexpected error, could not generate favicons from images or fallbacks', links);
  return null;
});

function getMatch(
  SETTINGS: AppDataGlobal,
  prop: { url: string | undefined; title: string | undefined }
): AppDataRule | false {
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

    const regex = new RegExp(rule.testPattern);
    if (regex.test(value)) {
      return rule;
    }
  }

  return false;
}

function getFallbackFavicon(SETTINGS: AppDataGlobal): string {
  let type = SETTINGS.favicon.type;
  if (type === 'custom') {
    if (SETTINGS.favicon.custom.length > 0) {
      return SETTINGS.favicon.custom;
    } else {
      type = defaultSettings.favicon.type;
    }
  }

  // FIXME: Find a way with Manifest v3
  //const themeSuffix = window?.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const themeSuffix = 'dark';
  return baseFavicons[`${type}_${themeSuffix}`];
}

async function getNewFavicon(SETTINGS: AppDataGlobal, item: AppDataRule, url = 'FALLBACK_FAVICON'): Promise<string> {
  if (url === 'FALLBACK_FAVICON') {
    url = getFallbackFavicon(SETTINGS);
  }

  try {
    const img = await loadImage(url);
    const drawingParams = createCanvasWithImage(img);
    if (isNull(drawingParams)) {
      img.close();
      console.warn('fallback on the default favicon');
      return Promise.resolve(url);
    }
    const { canvas, ctx } = drawingParams;
    drawFilterOnCanvas(canvas, ctx, item.color, item.filter);

    return await canvaToDataURL(canvas)
      .then((dataUrl) => dataUrl)
      .catch(() => url as string)
      .finally(() => img.close());
  } catch (e) {
    console.warn('Could not load the image.', e);
    return Promise.reject(url);
  }
}
