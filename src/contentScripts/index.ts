import debounce from 'just-debounce-it';
import { sendMessage } from 'webext-bridge/content-script';
import { isNull } from '~/utils';

interface IconNodeData {
  href: string | null;
  absoluteUrl: string | null;
}

{
  class EnvSpecificFavicon {
    static LINK_ID = 'env-specific-favicon';
    static ESF_CHANGE_MARK = 'esf-change-mark';
    static headNode: HTMLHeadElement;
    static allIconNodes = new Map<HTMLLinkElement, IconNodeData>();
    static visibleIconNode = document.createElement('link');
    static iconNodeObservers = new WeakMap<HTMLLinkElement, MutationObserver>();
    static visibleIconHref: string;
    static debouncedRefreshVisibleFavicon: ReturnType<typeof debounce<() => Promise<void>>>;

    static {
      this.init();
    }

    static init(): void {
      this.headNode = document.head;
      if (!isNull(this.headNode) && this.headNode.querySelector(`#${this.LINK_ID}`)) {
        return;
      }
      document.head.append(this.visibleIconNode);
      this.debouncedRefreshVisibleFavicon = debounce(() => this.refreshVisibleFavicon(), 20);

      this.updateAllIconNodes();
      this.observeVisibleIcon();
      this.observeHead();
      this.refreshVisibleFavicon();
    }

    static updateAllIconNodes(): { foundNewIconNodes: boolean } {
      const nodeList = document.head.querySelectorAll<HTMLLinkElement>(`
      link:not(#env-specific-favicon):not([rel="mask-icon"]):not([rel="fluid-icon"])[rel*="icon"],
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

    static updateAllIconNodesAndRefreshIfNeeded() {
      const { foundNewIconNodes } = this.updateAllIconNodes();
      if (foundNewIconNodes) {
        this.debouncedRefreshVisibleFavicon();
      }
    }

    static invalidateIconNode(node: HTMLLinkElement): void {
      this.addChangeMark(node);
      node.removeAttribute('href');
    }

    static getIconNodeData(iconNode: HTMLLinkElement): IconNodeData {
      const href = iconNode.getAttribute('href');
      const absoluteUrl = isNull(href) ? null : new URL(href, window.location.href).href;
      return {
        href,
        absoluteUrl,
      };
    }

    static updateVisibleIcon(): void {
      this.addChangeMark(this.visibleIconNode);
      this.visibleIconNode.setAttribute('id', this.LINK_ID);
      this.visibleIconNode.setAttribute('rel', 'icon');
      this.visibleIconNode.setAttribute('sizes', 'any');
      this.visibleIconNode.setAttribute('href', this.visibleIconHref);
    }

    static forceVisibleIconVisibility(): void {
      const lastHeadNode = this.headNode.querySelector(':last-child');

      const invalidNodePositionFlag =
        Node.DOCUMENT_POSITION_DISCONNECTED |
        Node.DOCUMENT_POSITION_PRECEDING |
        Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
      const isNotLastNode =
        !isNull(lastHeadNode) &&
        (lastHeadNode.compareDocumentPosition(this.visibleIconNode) & invalidNodePositionFlag) !== 0;

      if (isNotLastNode) {
        this.headNode.append(this.visibleIconNode);
      }
    }

    static observeHead(): void {
      const headObserver = new MutationObserver((mutations) => {
        let isNodesAdded = false;
        let isNodesRemoved = false;
        let isVisibleIconDeleted = false;
        mutations.some((m) => {
          if (!isNodesAdded) {
            const addedNodes = Array.from(m.addedNodes);
            isNodesAdded = addedNodes.some((n: any) => n.getAttribute('id') !== this.LINK_ID);
          }

          const removedNodes = Array.from(m.removedNodes);
          if (!isNodesRemoved) {
            isNodesRemoved = removedNodes.some((n: any) => n.getAttribute('id') !== this.LINK_ID);
          }

          if (!isVisibleIconDeleted) {
            isVisibleIconDeleted = removedNodes.some((n: any) => n.getAttribute('id') === this.LINK_ID);
          }

          return isVisibleIconDeleted && isNodesRemoved && isNodesAdded;
        });

        if (isNodesAdded || isVisibleIconDeleted) {
          this.forceVisibleIconVisibility();
        }

        if (isNodesAdded || isNodesRemoved) {
          this.updateAllIconNodesAndRefreshIfNeeded();
        }
      });
      headObserver.observe(document.head, { childList: true });
    }

    static setIconNodeObserver(iconNode: HTMLLinkElement): void {
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
        this.debouncedRefreshVisibleFavicon();
      });
      nodeObserver.observe(iconNode, { attributes: true, attributeFilter: ['href'] });
      this.iconNodeObservers.set(iconNode, nodeObserver);
    }

    static observeVisibleIcon(): void {
      const observer = new MutationObserver(() => {
        // The change has been made by our last update
        const hadChangeMark = this.checkAndRemoveChangeMark(this.visibleIconNode);
        if (hadChangeMark) {
          return;
        }

        const nodeData = this.getIconNodeData(this.visibleIconNode);
        if (nodeData.href !== this.visibleIconHref) {
          this.updateVisibleIcon();
        }
      });

      observer.observe(this.visibleIconNode, { attributes: true, attributeFilter: ['href'] });
    }

    static addChangeMark(iconNode: HTMLLinkElement): void {
      iconNode.setAttribute(this.ESF_CHANGE_MARK, 'true');
    }

    static checkAndRemoveChangeMark(iconNode: HTMLLinkElement): boolean {
      const hasChangeMark = iconNode.hasAttribute(this.ESF_CHANGE_MARK);
      if (hasChangeMark) {
        iconNode.removeAttribute(this.ESF_CHANGE_MARK);
      }
      return hasChangeMark;
    }

    static getAppropriateLinks(): string[] {
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

    static async refreshVisibleFavicon(): Promise<void> {
      const appropriateLinks = this.getAppropriateLinks();

      const response = await sendMessage('get-favicon-from-links', appropriateLinks, 'background');
      if (isNull(response)) {
        return;
      }
      this.visibleIconHref = response.favicon;
      this.updateVisibleIcon();
    }
  }
}
