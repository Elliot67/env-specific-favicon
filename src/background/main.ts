import browser from 'webextension-polyfill';
import { onMessage } from 'webext-bridge/background';
import { baseFavicons, defaultSettings } from '~/configuration/settings';
import { drawFilterOnCanvas, loadImage, SettingsStorage, createCanvasWithImage, canvaToDataURL } from '~/logic';
import { isNull, isUndefined } from '~/utils';
import { AppDataGlobal, AppDataRule } from '~/types/app';
import { TtlCache } from '~/utils/ttl-cache';

browser.runtime.onInstalled.addListener((event): void => {
  if (event.reason === 'install') {
    browser.runtime.openOptionsPage();
    return;
  }

  if (event.reason === 'update') {
    SettingsStorage.applyMigrations();
  }
});

//
// Caches
type GetReturnTypeOfMessage<K extends string> = ReturnType<Parameters<typeof onMessage<any, K>>[1]>;

const cacheTtl = 1_000 * 15; // 15 secondes
const cacheGetMatch = new TtlCache<string, GetReturnTypeOfMessage<'get-match'>>({ ttl: cacheTtl });
const cacheGetFaviconFromLinks = new TtlCache<string, GetReturnTypeOfMessage<'get-favicon-from-links'>>({
  ttl: cacheTtl,
});

browser.storage.local.onChanged.addListener((changes) => {
  cacheGetMatch.clear();
  cacheGetFaviconFromLinks.clear();
});

// Generate favicon for Options page
onMessage('get-favicon', async ({ data }) => {
  const SETTINGS = await SettingsStorage.getItem();
  return { favicon: await getNewFavicon(data, [getFallbackFavicon(SETTINGS)]) };
});

// Find out if the tab has a corresponding rule
onMessage('get-match', async ({ data }) => {
  const cacheKey = '' + data.url + data.title;
  const cacheResponse = cacheGetMatch.get(cacheKey);
  if (!isUndefined(cacheResponse)) {
    return cacheResponse;
  }

  const SETTINGS = await SettingsStorage.getItem();

  const match = getMatch(SETTINGS, { url: data.url, title: data.title });

  const response = match === false ? null : match.id;
  cacheGetMatch.set(cacheKey, response);
  return response;
});

// Generate favicon for the content script
onMessage('get-favicon-from-links', async ({ data: { links, matchId } }) => {
  const cacheKey = '' + links.sort().join('') + matchId;
  const cacheResponse = cacheGetFaviconFromLinks.get(cacheKey);
  if (!isUndefined(cacheResponse)) {
    return cacheResponse;
  }

  const SETTINGS = await SettingsStorage.getItem();
  const match = SETTINGS.rules.find((rule) => rule.id === matchId);
  if (isUndefined(match)) {
    return null;
  }

  links.push(getFallbackFavicon(SETTINGS));

  try {
    const favicon = await getNewFavicon(match, links);
    const response = { favicon };
    cacheGetFaviconFromLinks.set(cacheKey, response);
    return response;
  } catch (e) {
    return null;
  }
});

function getMatch(
  SETTINGS: AppDataGlobal,
  prop: { url: string | undefined; title: string | undefined },
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

async function getNewFavicon(rule: AppDataRule, links: string[]): Promise<string> {
  if (rule.replacementType === 'external') {
    return rule.externalFaviconLink;
  }

  for (const link of links) {
    try {
      const customizedFavicon = await getCustomizedFavicon(rule, link);
      return customizedFavicon;
    } catch (e) {
      console.warn('error while generating the favicon with this link, trying the next link', e);
    }
  }

  throw new Error('Unexpected error, could not generate favicons from images or fallbacks', {
    cause: {
      links,
    },
  });
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

async function getCustomizedFavicon(item: AppDataRule, url: string): Promise<string> {
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
