import { sendMessage } from 'webext-bridge';
import { isNull, isUndefined } from '~/utils';

(async () => {
  const $head = document.head;
  const LINK_ID = 'env-specific-favicon';

  if (isNull($head) || $head.querySelector(`#${LINK_ID}`)) {
    return;
  }

  // Functions
  const get$Links = (): NodeListOf<HTMLLinkElement> => {
    return document.head.querySelectorAll<HTMLLinkElement>(`
    link:not(#env-specific-favicon):not([rel="mask-icon"])[rel*="icon"],
    link[rel="apple-touch-startup-image"]
    `);
  };

  const removeOtherIcons = ($links: NodeListOf<HTMLLinkElement>): void => {
    $links.forEach(($link) => {
      $link.remove();
    });
  };

  const $links = get$Links();
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
  $head.append($newFavicon);
  removeOtherIcons($links);

  // Remove icons added on the fly
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((m) => m.addedNodes.length > 0)) {
      const $links = get$Links();
      removeOtherIcons($links);
    }
  });
  observer.observe(document.head, { childList: true, attributeFilter: [] });
})();
