import debounce from 'just-debounce-it';
import { sendMessage } from 'webext-bridge/content-script';
import { AppDataRule } from '~/types/app';
import { isNull } from '~/utils';

interface IconNodeData {
  href: string | null;
  absoluteUrl: string | null;
}

{
  class EnvSpecificFaviconSingleton {
    static activeInstance: EnvSpecificFavicon | null = null;

    static {
      this.runWhenNeeded();
    }

    static async runWhenNeeded(): Promise<void> {
      this.handleUrlChanges();
      // TODO: Also handle title changes with mutation observer

      const matchId = await this.getNewMatchId();
      if (!isNull(matchId)) {
        this.activeInstance = new EnvSpecificFavicon(matchId);
      }
    }

    static async handleUrlChanges(): Promise<void> {
      // Only for Chromium, not yet supported in Firefox & Safari
      if (!('navigation' in window)) {
        return;
      }

      (window.navigation as any).addEventListener('navigatesuccess', async () => {
        const matchId = await this.getNewMatchId();
        const hasMatch = !isNull(matchId);

        if (isNull(this.activeInstance)) {
          if (hasMatch) {
            this.activeInstance = new EnvSpecificFavicon(matchId);
          }

          return;
        }

        if (!hasMatch) {
          this.activeInstance.terminate();
          this.activeInstance = null;
          return;
        }

        if (matchId === this.activeInstance.matchId) {
          return;
        }

        this.activeInstance.terminate();
        this.activeInstance = new EnvSpecificFavicon(matchId);
      });
    }

    static getNewMatchId() {
      return sendMessage('get-match', { url: window.location.href, title: document.title }, 'background');
    }
  }

  class EnvSpecificFavicon {
    private static LINK_ID = 'env-specific-favicon';
    private static ESF_CHANGE_MARK = 'esf-change-mark';

    public matchId: string;

    private headNode: HTMLHeadElement;
    private allIconNodes = new Map<HTMLLinkElement, IconNodeData>();
    private customIconNode = document.createElement('link');
    private iconNodeObservers = new WeakMap<HTMLLinkElement, MutationObserver>();
    private customIconHref: string = '';
    private debouncedRefreshCustomFavicon: ReturnType<typeof debounce<() => Promise<void>>>;
    private headObserver: MutationObserver | null = null;

    constructor(matchId: AppDataRule['id']) {
      this.matchId = matchId;
      this.headNode = document.head;
      if (!isNull(this.headNode) && this.headNode.querySelector(`#${EnvSpecificFavicon.LINK_ID}`)) {
        throw new Error(`Document is missing a head or EnvSpecificFavicon is already active in the page.`);
      }

      this.customIconNode.setAttribute('id', EnvSpecificFavicon.LINK_ID);
      this.customIconNode.setAttribute('href', 'data:,');
      document.head.append(this.customIconNode);
      this.debouncedRefreshCustomFavicon = debounce(() => this.refreshCustomFavicon(), 20);

      this.updateAllIconNodes();
      this.observeCustomIcon();
      this.observeHead();
      this.refreshCustomFavicon();
    }

    updateAllIconNodes(): { foundNewIconNodes: boolean } {
      const nodeList = document.head.querySelectorAll<HTMLLinkElement>(`
      link:not(#${EnvSpecificFavicon.LINK_ID}):not([rel="mask-icon"]):not([rel="fluid-icon"])[rel*="icon"],
      link[rel="apple-touch-startup-image"]
      `);

      let foundNewIconNodes = false;
      nodeList.forEach((iconNode) => {
        if (this.allIconNodes.has(iconNode)) {
          return;
        }
        if (!foundNewIconNodes) {
          foundNewIconNodes = true;
        }

        const data: IconNodeData = this.getIconNodeData(iconNode);
        this.allIconNodes.set(iconNode, data);
        this.setIconNodeObserver(iconNode);
        this.invalidateIconNode(iconNode);
      });

      // Clean up removed icon from this.allIconNodes
      const nodeListSet = new Set(nodeList);
      for (const iconNode of this.allIconNodes.keys()) {
        if (nodeListSet.has(iconNode)) {
          continue;
        }
        this.allIconNodes.delete(iconNode);
        const observer = this.iconNodeObservers.get(iconNode)!;
        observer.disconnect();
        this.iconNodeObservers.delete(iconNode);
      }

      return {
        foundNewIconNodes: foundNewIconNodes,
      };
    }

    updateAllIconNodesAndRefreshIfNeeded() {
      const { foundNewIconNodes } = this.updateAllIconNodes();
      if (foundNewIconNodes) {
        this.debouncedRefreshCustomFavicon();
      }
    }

    invalidateIconNode(node: HTMLLinkElement): void {
      this.addChangeMark(node);
      node.removeAttribute('href');
    }

    getIconNodeData(iconNode: HTMLLinkElement): IconNodeData {
      const href = iconNode.getAttribute('href');
      const absoluteUrl = isNull(href) ? null : new URL(href, window.location.href).href;
      return {
        href,
        absoluteUrl,
      };
    }

    updateCustomIcon(): void {
      this.addChangeMark(this.customIconNode);
      this.customIconNode.setAttribute('id', EnvSpecificFavicon.LINK_ID);
      this.customIconNode.setAttribute('rel', 'icon');
      this.customIconNode.setAttribute('sizes', 'any');
      this.customIconNode.setAttribute('href', this.customIconHref);
    }

    forceCustomIconVisibility(): void {
      const lastHeadNode = this.headNode.querySelector(':last-child');

      const invalidNodePositionFlag =
        Node.DOCUMENT_POSITION_DISCONNECTED |
        Node.DOCUMENT_POSITION_PRECEDING |
        Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
      const isNotLastNode =
        !isNull(lastHeadNode) &&
        (lastHeadNode.compareDocumentPosition(this.customIconNode) & invalidNodePositionFlag) !== 0;

      if (isNotLastNode) {
        this.headNode.append(this.customIconNode);
      }
    }

    observeHead(): void {
      this.headObserver = new MutationObserver((mutations) => {
        let isNodesAdded = false;
        let isNodesRemoved = false;
        let isCustomIconDeleted = false;
        mutations.some((m) => {
          if (!isNodesAdded) {
            const addedNodes = Array.from(m.addedNodes);
            isNodesAdded = addedNodes.some((n: any) => n.getAttribute('id') !== EnvSpecificFavicon.LINK_ID);
          }

          const removedNodes = Array.from(m.removedNodes);
          if (!isNodesRemoved) {
            isNodesRemoved = removedNodes.some((n: any) => n.getAttribute('id') !== EnvSpecificFavicon.LINK_ID);
          }

          if (!isCustomIconDeleted) {
            isCustomIconDeleted = removedNodes.some((n: any) => n.getAttribute('id') === EnvSpecificFavicon.LINK_ID);
          }

          return isCustomIconDeleted && isNodesRemoved && isNodesAdded;
        });

        if (isNodesAdded || isCustomIconDeleted) {
          this.forceCustomIconVisibility();
        }

        if (isNodesAdded || isNodesRemoved) {
          this.updateAllIconNodesAndRefreshIfNeeded();
        }
      });
      this.headObserver.observe(document.head, { childList: true });
    }

    setIconNodeObserver(iconNode: HTMLLinkElement): void {
      if (this.iconNodeObservers.has(iconNode)) {
        return;
      }

      const nodeObserver = new MutationObserver((mutations) => {
        // The change has been made by our invalidation system
        const hadChangeMark = this.checkAndRemoveChangeMark(iconNode);
        if (hadChangeMark) {
          return;
        }
        this.allIconNodes.set(iconNode, this.getIconNodeData(iconNode));
        this.invalidateIconNode(iconNode);
        this.debouncedRefreshCustomFavicon();
      });
      nodeObserver.observe(iconNode, { attributes: true, attributeFilter: ['href'] });
      this.iconNodeObservers.set(iconNode, nodeObserver);
    }

    observeCustomIcon(): void {
      const observer = new MutationObserver(() => {
        // The change has been made by our last update
        const hadChangeMark = this.checkAndRemoveChangeMark(this.customIconNode);
        if (hadChangeMark) {
          return;
        }

        const nodeData = this.getIconNodeData(this.customIconNode);
        if (nodeData.href !== this.customIconHref) {
          this.updateCustomIcon();
        }
      });

      observer.observe(this.customIconNode, { attributes: true, attributeFilter: ['href'] });
    }

    addChangeMark(iconNode: HTMLLinkElement): void {
      iconNode.setAttribute(EnvSpecificFavicon.ESF_CHANGE_MARK, 'true');
    }

    checkAndRemoveChangeMark(iconNode: HTMLLinkElement): boolean {
      const hasChangeMark = iconNode.hasAttribute(EnvSpecificFavicon.ESF_CHANGE_MARK);
      if (hasChangeMark) {
        iconNode.removeAttribute(EnvSpecificFavicon.ESF_CHANGE_MARK);
      }
      return hasChangeMark;
    }

    getAppropriateLinks(): string[] {
      const appropriateLinks = new Set<string>();
      appropriateLinks.add(window.location.origin + '/favicon.ico');

      for (const [iconNode, data] of this.allIconNodes) {
        const absoluteUrl = data.absoluteUrl;
        // Due to a lack of browser support, svg icons aren't supported because
        // browsers don't have support for image/svg+xml blob in createimageBitmap()
        // TODO: Might want to convert the svg to a base64 blob if the document doesn't provide any other icon
        //  https://stackoverflow.com/questions/69314193/cannot-create-bitmap-from-svg
        //  https://github.com/Kaiido/createImageBitmap
        const isLinkAppropriate = !isNull(absoluteUrl) && !absoluteUrl.endsWith('.svg');
        if (isLinkAppropriate) {
          appropriateLinks.add(absoluteUrl);
        }
      }

      // We reverse the array, because according to the spec, if multiple equally
      // appropriate icons are in the DOM tree, the last one will take precedence
      // https://html.spec.whatwg.org/#rel-icon
      const sortedUrlArray = Array.from(appropriateLinks).reverse();

      // TODO: The order could be improved by taking the size into account, here is Firefox priority order:
      //  https://searchfox.org/mozilla-central/source/browser/modules/FaviconLoader.sys.mjs#444 (FaviconLoader.sys.mjs:selectIcons)
      //  1. SVG format
      //  2. exact requested size
      //  3. ICO format
      //  4. lowest size of available sizes which are higher than the requested size

      return sortedUrlArray;
    }

    async refreshCustomFavicon(): Promise<void> {
      const appropriateLinks = this.getAppropriateLinks();

      const response = await sendMessage(
        'get-favicon-from-links',
        { links: appropriateLinks, matchId: this.matchId },
        'background',
      );
      if (isNull(response)) {
        return;
      }
      this.customIconHref = response.favicon;
      this.updateCustomIcon();
    }

    terminate(): void {
      if (!isNull(this.headObserver)) {
        this.headObserver.disconnect();
      }

      this.customIconNode.remove();

      for (const iconNode of this.allIconNodes.keys()) {
        const iconNodeData = this.allIconNodes.get(iconNode)!;
        const observer = this.iconNodeObservers.get(iconNode)!;
        observer?.disconnect();
        if (!isNull(iconNodeData.href)) {
          iconNode.setAttribute('href', iconNodeData.href);
        }
        this.iconNodeObservers.delete(iconNode);
      }
      this.allIconNodes.clear();
    }
  }
}
