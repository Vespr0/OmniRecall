import { setIcon } from 'obsidian';
import { CacheManager } from '../cache/cacheManager';

export class BrowseView {
  private containerEl: HTMLElement;
  private cacheManager: CacheManager;
  private onBack: () => void;
  private goReviewFiltered: (path: string) => void;
  private expandedFolders: Record<string, boolean> = {};

  constructor(
    containerEl: HTMLElement,
    cacheManager: CacheManager,
    onBack: () => void,
    goReviewFiltered: (path: string) => void
  ) {
    this.containerEl = containerEl;
    this.cacheManager = cacheManager;
    this.onBack = onBack;
    this.goReviewFiltered = goReviewFiltered;

    this.render();
  }

  public render() {
    this.containerEl.empty();
    const browseWrapper = this.containerEl.createDiv('srf-browse-container');

    // Header
    const header = browseWrapper.createDiv('srf-browse-header');
    const backBtn = header.createEl('button', { cls: 'srf-back-btn', text: '← Back' });
    backBtn.onclick = () => this.onBack();
    header.createEl('h2', { text: 'Vault Flashcards' });

    // Build Tree
    const tree = this.buildTree();
    const treeContainer = browseWrapper.createDiv('srf-tree-container');

    this.renderTree(treeContainer, tree, 0, '');
  }

  private buildTree(): Record<string, any> {
    const tree: Record<string, any> = {};
    const cache = this.cacheManager.getCacheData();

    for (const filePath in cache) {
      const cards = cache[filePath].cards.filter((c) => c.fsrsData !== null);
      if (cards.length === 0) continue;

      const parts = filePath.split('/');
      let current = tree;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = i === parts.length - 1
            ? { _file: true, path: filePath, count: cards.length }
            : {};
        }
        current = current[part];
      }
    }
    return tree;
  }

  private renderTree(container: HTMLElement, node: any, depth: number, pathPrefix: string) {
    const keys = Object.keys(node).filter((k) => k !== '_file' && k !== 'path' && k !== 'count');

    for (const key of keys) {
      const itemEl = container.createDiv('srf-tree-item');
      itemEl.style.marginLeft = `${depth * 16}px`;

      if (node[key]._file) {
        const row = itemEl.createDiv('srf-browser-row');
        row.createDiv({ cls: 'srf-file-name', text: `📄 ${key} (${node[key].count})` });

        const playBtn = row.createEl('button', {
          cls: 'srf-play-btn',
          title: `Review ${key}`,
          ariaLabel: `Review ${key}`,
        });
        setIcon(playBtn, 'play');
        playBtn.onclick = () => this.goReviewFiltered(node[key].path);
      } else {
        const newPrefix = pathPrefix ? `${pathPrefix}/${key}` : key;
        const isExpanded = !!this.expandedFolders[newPrefix];

        const row = itemEl.createDiv('srf-browser-row');
        const folderHeader = row.createDiv('srf-folder-header');

        const treeIcon = folderHeader.createSpan({
          cls: 'srf-tree-icon',
          text: isExpanded ? '📂' : '📁',
        });
        folderHeader.createSpan({ text: key });

        folderHeader.onclick = () => {
          this.expandedFolders[newPrefix] = !this.expandedFolders[newPrefix];
          this.render();
        };

        const playBtn = row.createEl('button', {
          cls: 'srf-play-btn',
          title: `Review folder ${key}`,
          ariaLabel: `Review folder ${key}`,
        });
        setIcon(playBtn, 'play');
        playBtn.onclick = () => this.goReviewFiltered(newPrefix);

        if (isExpanded) {
          this.renderTree(itemEl, node[key], depth + 1, newPrefix);
        }
      }
    }
  }
}
