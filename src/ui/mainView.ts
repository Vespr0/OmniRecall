import { ItemView, WorkspaceLeaf, MarkdownRenderer } from 'obsidian';
import { CacheManager } from '../cache/cacheManager';
import { Flashcard } from '../parser/parser';
import { FSRSEngine } from '../fsrs/engine';
import { Rating } from 'ts-fsrs';
import { serializeFSRSCard } from '../fsrs/dataMap';

export const VIEW_TYPE_FSRS_MAIN = "fsrs-main-view";

enum ViewState {
    Menu,
    Review,
    Browse
}

export class FSRSMainView extends ItemView {
    private cacheManager: CacheManager;
    private fsrsEngine: FSRSEngine;
    
    // State
    private currentState: ViewState = ViewState.Menu;
    
    // Review State
    private reviewQueue: { file: string, card: Flashcard }[] = [];
    private currentCardIndex: number = 0;
    private isShowingAnswer: boolean = false;

    constructor(leaf: WorkspaceLeaf, cacheManager: CacheManager) {
        super(leaf);
        this.cacheManager = cacheManager;
        this.fsrsEngine = new FSRSEngine();
    }

    getViewType(): string {
        return VIEW_TYPE_FSRS_MAIN;
    }

    getDisplayText(): string {
        return "FSRS Flashcards";
    }

    async onOpen() {
        this.currentState = ViewState.Menu;
        this.render();
    }

    private render() {
        const container = this.containerEl.children[1];
        container.empty();

        const wrapper = container.createDiv({ cls: 'fsrs-wrapper' });
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.height = '100%';
        wrapper.style.overflowY = 'auto';
        wrapper.style.padding = '20px';

        if (this.currentState === ViewState.Menu) {
            this.renderMenu(wrapper);
        } else if (this.currentState === ViewState.Review) {
            this.renderReview(wrapper); // Will run async safely
        } else if (this.currentState === ViewState.Browse) {
            this.renderBrowse(wrapper);
        }
    }

    private renderMenu(container: HTMLElement) {
        container.style.alignItems = 'center';
        
        container.createEl('h2', { text: 'FSRS Statistics' });
        const statsBox = container.createDiv();
        statsBox.style.width = '100%';
        statsBox.style.height = '150px';
        statsBox.style.border = '1px dashed var(--text-muted)';
        statsBox.style.borderRadius = '10px';
        statsBox.style.display = 'flex';
        statsBox.style.alignItems = 'center';
        statsBox.style.justifyContent = 'center';
        statsBox.style.marginBottom = '40px';
        statsBox.innerText = 'Statistics Bar Graph (Coming Soon)';

        const dueCount = this.cacheManager.getReviewQueue().length;

        const reviewBtn = container.createEl('button', { text: `Review (${dueCount} Due)` });
        reviewBtn.style.padding = '15px 30px';
        reviewBtn.style.fontSize = '1.2em';
        reviewBtn.style.marginBottom = '20px';
        reviewBtn.style.cursor = 'pointer';
        reviewBtn.style.width = '250px';
        reviewBtn.style.backgroundColor = 'var(--interactive-accent)';
        reviewBtn.style.color = 'var(--text-on-accent)';
        
        reviewBtn.onclick = () => {
            this.startReview();
        };

        const browseBtn = container.createEl('button', { text: 'Browse Flashcards' });
        browseBtn.style.padding = '15px 30px';
        browseBtn.style.fontSize = '1.2em';
        browseBtn.style.cursor = 'pointer';
        browseBtn.style.width = '250px';

        browseBtn.onclick = () => {
            this.currentState = ViewState.Browse;
            this.render();
        };
    }

    private startReview() {
        this.reviewQueue = this.cacheManager.getReviewQueue();
        this.currentCardIndex = 0;
        this.isShowingAnswer = false;
        this.currentState = ViewState.Review;
        this.render();
    }

    // --- BROWSE LOGIC ---
    private renderBrowse(container: HTMLElement) {
        const header = container.createDiv();
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.marginBottom = '20px';

        const backBtn = header.createEl('button', { text: '← Back' });
        backBtn.onclick = () => {
            this.currentState = ViewState.Menu;
            this.render();
        };

        header.createEl('h2', { text: 'Vault Flashcards' }).style.marginLeft = '20px';

        const treeContainer = container.createDiv();
        treeContainer.style.overflowY = 'auto';
        treeContainer.style.flexGrow = '1';

        // Group cards by folder
        const cache = this.cacheManager.getCacheData();
        const tree: Record<string, any> = {};

        for (const filePath in cache) {
            const cards = cache[filePath].cards.filter(c => c.fsrsData !== null);
            if (cards.length === 0) continue;

            const parts = filePath.split('/');
            let current = tree;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (!current[part]) {
                    current[part] = i === parts.length - 1 ? { _file: true, path: filePath, count: cards.length } : {};
                }
                current = current[part];
            }
        }

        this.renderTree(treeContainer, tree, 0);
    }

    private renderTree(container: HTMLElement, node: any, depth: number) {
        for (const key in node) {
            if (key === '_file' || key === 'path' || key === 'count') continue;

            const item = node[key];
            const itemEl = container.createDiv();
            itemEl.style.marginLeft = `${depth * 20}px`;
            itemEl.style.padding = '5px 0';

            if (item._file) {
                itemEl.innerText = `📄 ${key} (${item.count} cards)`;
                itemEl.style.color = 'var(--text-normal)';
            } else {
                const folderHeader = itemEl.createDiv();
                folderHeader.style.cursor = 'pointer';
                folderHeader.style.fontWeight = 'bold';
                
                const icon = folderHeader.createSpan({ text: '▶ 📁 ' });
                folderHeader.createSpan({ text: key });

                const childrenContainer = itemEl.createDiv();
                childrenContainer.style.display = 'none'; // collapsed by default
                
                folderHeader.onclick = () => {
                    const isCollapsed = childrenContainer.style.display === 'none';
                    childrenContainer.style.display = isCollapsed ? 'block' : 'none';
                    icon.innerText = isCollapsed ? '▼ 📂 ' : '▶ 📁 ';
                };

                this.renderTree(childrenContainer, item, depth + 1);
            }
        }
    }

    // --- REVIEW LOGIC ---
    private async renderReview(container: HTMLElement) {
        container.style.alignItems = 'center';

        const topBar = container.createDiv();
        topBar.style.width = '100%';
        topBar.style.display = 'flex';
        topBar.style.justifyContent = 'space-between';
        
        const backBtn = topBar.createEl('button', { text: '← Menu' });
        backBtn.onclick = () => {
            this.currentState = ViewState.Menu;
            this.render();
        };

        if (this.reviewQueue.length === 0) {
            container.createEl('h3', { text: 'Congratulations!' }).style.marginTop = '40px';
            container.createEl('p', { text: 'You have reviewed all due flashcards.' });
            return;
        }

        const currentItem = this.reviewQueue[this.currentCardIndex];
        const flashcard = currentItem.card;

        const progressEl = container.createDiv({ cls: 'fsrs-progress' });
        progressEl.innerText = `Card ${this.currentCardIndex + 1} of ${this.reviewQueue.length}`;
        progressEl.style.margin = '20px 0';
        progressEl.style.color = 'var(--text-muted)';

        const cardContainer = container.createDiv({ cls: 'fsrs-card' });
        cardContainer.style.background = 'var(--background-secondary)';
        cardContainer.style.padding = '30px';
        cardContainer.style.borderRadius = '10px';
        cardContainer.style.width = '100%';
        cardContainer.style.maxWidth = '600px';
        cardContainer.style.textAlign = 'center';
        cardContainer.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        cardContainer.style.cursor = this.isShowingAnswer ? 'default' : 'pointer';

        const frontEl = cardContainer.createDiv({ cls: 'fsrs-front' });
        
        // Await Markdown rendering to ensure DOM flows correctly before button creation
        await MarkdownRenderer.render(this.app, flashcard.front, frontEl, currentItem.file, this);
        
        frontEl.style.fontSize = '1.5em';
        frontEl.style.marginBottom = this.isShowingAnswer ? '20px' : '0';

        if (!this.isShowingAnswer) {
            cardContainer.onclick = () => {
                this.isShowingAnswer = true;
                this.render();
            };
            
            const hint = container.createDiv();
            hint.innerText = "Click card to reveal answer";
            hint.style.marginTop = '20px';
            hint.style.color = 'var(--text-muted)';
        } else {
            const divider = cardContainer.createEl('hr');
            divider.style.margin = '20px 0';
            
            const backEl = cardContainer.createDiv({ cls: 'fsrs-back' });
            await MarkdownRenderer.render(this.app, flashcard.back, backEl, currentItem.file, this);
            backEl.style.fontSize = '1.2em';

            const buttonContainer = container.createDiv({ cls: 'fsrs-buttons' });
            buttonContainer.style.display = 'flex';
            buttonContainer.style.flexWrap = 'wrap';
            buttonContainer.style.justifyContent = 'center';
            buttonContainer.style.gap = '10px';
            buttonContainer.style.marginTop = '30px';
            buttonContainer.style.flexShrink = '0'; // Prevent buttons from being squished if content is large
            buttonContainer.style.width = '100%';

            const ratings = [
                { rating: Rating.Again, text: 'Again', color: 'var(--color-red)' },
                { rating: Rating.Hard, text: 'Hard', color: 'var(--color-orange)' },
                { rating: Rating.Good, text: 'Good', color: 'var(--color-green)' },
                { rating: Rating.Easy, text: 'Easy', color: 'var(--color-blue)' }
            ];

            const now = new Date();
            
            ratings.forEach(r => {
                const schedulingInfo = this.fsrsEngine.reviewCard(flashcard.fsrsData!.card, r.rating, now);
                const nextDue = schedulingInfo.card.due;
                const daysStr = this.getDaysString(now, nextDue);

                const btn = buttonContainer.createEl('button');
                btn.style.display = 'flex';
                btn.style.flexDirection = 'column';
                btn.style.alignItems = 'center';
                btn.style.padding = '10px 20px';
                btn.style.border = `1px solid ${r.color}`;
                btn.style.background = 'transparent';
                btn.style.cursor = 'pointer';
                btn.style.borderRadius = '5px';
                
                btn.createSpan({ text: r.text }).style.color = r.color;
                btn.createSpan({ text: daysStr }).style.fontSize = '0.8em';
                (btn.lastElementChild as HTMLElement).style.color = 'var(--text-muted)';

                btn.onclick = async () => {
                    await this.processReview(currentItem, r.rating, schedulingInfo.card, schedulingInfo.log);
                };
            });
        }
    }

    private getDaysString(now: Date, nextDue: Date): string {
        const diffMs = nextDue.getTime() - now.getTime();
        const diffDays = Math.max(0, diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 1) return "< 1d";
        if (diffDays < 30) return `${Math.round(diffDays)}d`;
        if (diffDays < 365) return `${Math.round(diffDays / 30)}mo`;
        return `${(diffDays / 365).toFixed(1)}y`;
    }

    private async processReview(item: { file: string, card: Flashcard }, rating: Rating, nextCardState: any, reviewLog: any) {
        try {
            const file = this.app.vault.getAbstractFileByPath(item.file);
            if (!file) return;

            const currentId = item.card.fsrsData!.id;
            const newFsrsString = serializeFSRSCard(currentId, nextCardState);

            console.log('Replacing FSRS:', currentId, nextCardState);
            await this.app.vault.process(file as any, (data) => {
                const exactRegex = new RegExp(`<!--FSRS:${currentId}\\|[^>]+-->`, 'g');
                const replaced = data.replace(exactRegex, newFsrsString);
                if (data === replaced) {
                    console.error('FSRS replace FAILED. Regex did not match!', currentId);
                    console.log('Regex:', exactRegex);
                    console.log('Data:', data.substring(0, 200) + '...');
                } else {
                    console.log('FSRS successfully replaced in file.');
                }
                return replaced;
            });

            this.currentCardIndex++;
            this.isShowingAnswer = false;
            
            // Optimistic Cache Update: Prevent review loop race conditions
            // Since this mutates the reference inside CacheManager, getReviewQueue() will instantly skip this card.
            item.card.fsrsData = {
                id: currentId,
                card: nextCardState,
                rawString: newFsrsString
            };
            
            if (this.currentCardIndex >= this.reviewQueue.length) {
                this.reviewQueue = this.cacheManager.getReviewQueue();
                this.currentCardIndex = 0;
            }

            this.render();
        } catch (e) {
            console.error(e);
        }
    }
}
