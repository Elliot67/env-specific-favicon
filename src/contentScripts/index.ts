import { sendMessage } from 'webext-bridge';
import { isNull, isUndefined } from '~/utils';

(async () => {
  const $head = document.head;
  const LINK_ID = 'env-specific-favicon';

  if (isNull($head) || $head.querySelector(`#${LINK_ID}`)) {
    return;
  }

  const $links = document.head.querySelectorAll<HTMLLinkElement>(`
    link:not(#env-specific-favicon):not([rel="mask-icon"])[rel*="icon"],
    link[rel="apple-touch-startup-image"]
    `);

  const links = Array.from($links).reduce((acc, $l) => {
    const href = $l.href;
    if (!isUndefined(href) && !acc.includes(href)) {
      const operation = href.endsWith('.svg') ? 'unshift' : 'push';
      acc[operation](href);
    }
    return acc;
  }, [] as string[]);

  if (links.length === 0) {
    links.push(window.location.origin + '/favicon.ico');
  }

  const data = await sendMessage('get-favicon-from-links', links, 'background');
  if (isNull(data)) {
    return;
  }

  const $newFavicon = document.createElement('link');
  $newFavicon.setAttribute('id', LINK_ID);
  $newFavicon.setAttribute('rel', 'icon');
  $newFavicon.setAttribute('href', data.favicon);

  $links.forEach(($link) => {
    $link.remove();
  });

  $head.prepend($newFavicon);
})();
