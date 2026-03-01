import { 
    Decoration, 
    DecorationSet, 
    EditorView, 
    ViewPlugin, 
    ViewUpdate, 
    WidgetType 
} from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

import { parseFSRSString } from '../../fsrs/dataMap';
import { State } from 'ts-fsrs';
import { App } from 'obsidian';
import { CacheManager } from '../../cache/cacheManager';
import { FSRSPluginSettings } from '../../main';

export function createBadgeDOM(fsrsString: string, settings?: FSRSPluginSettings): HTMLElement {
    const span = document.createElement("span");
    span.className = "fsrs-indicator";
    span.style.fontSize = "0.75em";
    span.style.cursor = "help";
    span.style.margin = "0 6px";
    span.style.padding = "2px 8px";
    span.style.borderRadius = "10px";
    span.style.verticalAlign = "text-bottom";
    span.style.fontWeight = "bold";
    
    const parsed = parseFSRSString(fsrsString);
    if (!parsed) {
        span.style.color = "var(--text-muted)";
        span.style.border = "1px solid var(--text-faint)";
        span.innerText = "Invalid Card";
        span.title = "FSRS block is malformed";
        return span;
    }

    const card = parsed.card;
    const now = new Date();
    
    // Determine status UI
    let color = "";
    let bgColor = "";
    let label = "";

    if (card.state === State.Review) {
        if (card.due <= now) {
            color = "var(--color-red)";
            bgColor = "rgba(var(--color-red-rgb), 0.1)";
            label = "🧠 Due";
        } else {
            color = "var(--color-green)";
            bgColor = "rgba(var(--color-green-rgb), 0.1)";
            label = "🧠 Mature";
        }
    } else if (card.state === State.Learning || card.state === State.Relearning) {
        color = "var(--color-blue)";
        bgColor = "rgba(var(--color-blue-rgb), 0.1)";
        label = "🧠 Learning";
    } else {
        color = "var(--text-muted)";
        bgColor = "var(--background-modifier-border)";
        label = "🧠 New";
    }

    span.style.color = color;
    span.style.backgroundColor = bgColor;
    span.innerText = label;

    // Format tooltip
    const dueStr = card.due.toISOString().split('T')[0];
    const sStr = card.stability.toFixed(2);
    const dStr = card.difficulty.toFixed(2);
    span.title = `Due: ${dueStr} | S: ${sStr} | D: ${dStr} | Reps: ${card.reps}`;

    return span;
}

class FSRSIconWidget extends WidgetType {
    private fsrsString: string;
    private settings: FSRSPluginSettings;

    constructor(fsrsString: string, settings: FSRSPluginSettings) {
        super();
        this.fsrsString = fsrsString;
        this.settings = settings;
    }

    toDOM() {
        return createBadgeDOM(this.fsrsString, this.settings);
    }
}

export const createFSRSDecoration = (app: App, cacheManager: CacheManager, settings: FSRSPluginSettings) => ViewPlugin.fromClass(class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = this.buildDecorations(update.view);
        }

        // Trigger A: Spatial Blur
        if (update.selectionSet || update.docChanged) {
            const activeFile = app.workspace.getActiveFile();
            if (activeFile && cacheManager.hasUnborn(activeFile.path)) {
                const ranges = cacheManager.getUnbornRanges(activeFile.path);
                if (ranges.length > 0) {
                    const cursorLine = update.state.doc.lineAt(update.state.selection.main.head).number;
                    // If cursor is fully outside all unborn flashcard blocks, safely flush to disk
                    const isOutside = ranges.every(r => cursorLine < r.start || cursorLine > r.end);
                    if (isOutside) {
                        cacheManager.flushFile(activeFile);
                    }
                }
            }
        }
    }

    buildDecorations(view: EditorView) {
        const builder = new RangeSetBuilder<Decoration>();
        
        for (let { from, to } of view.visibleRanges) {
            const text = view.state.doc.sliceString(from, to);
            
            const regex = /<!--FSRS:([A-Za-z0-9_-]+)\|(\d{8,14})\|([\d.]+)\|([\d.]+)\|(\d+)\|(\d+)\|(\d+)-->/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const matchStart = from + match.index;
                const matchEnd = matchStart + match[0].length;
                
                builder.add(
                    matchStart, 
                    matchEnd, 
                    Decoration.replace({
                        widget: new FSRSIconWidget(match[0], settings)
                    })
                );
            }
        }
        return builder.finish();
    }
}, {
    decorations: v => v.decorations
});
