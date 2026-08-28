import { 
  Decoration, 
  DecorationSet, 
  EditorView, 
  ViewPlugin, 
  ViewUpdate, 
  WidgetType 
} from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import { parseFSRSString } from '../fsrs/dataMap';
import { State } from 'ts-fsrs';
import { App } from 'obsidian';
import { CacheManager } from '../cache/cacheManager';
import { FSRSPluginSettings } from '../main';

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
  
  let color = "";
  let bgColor = "";
  let label = "";

  if (card.state === State.Review) {
    if (card.due <= now) {
      color = "var(--color-red, #ef4444)";
      bgColor = "rgba(239, 68, 68, 0.12)";
      label = "🧠 Due";
    } else {
      color = "var(--color-green, #22c55e)";
      bgColor = "rgba(34, 197, 94, 0.12)";
      label = "🧠 Mature";
    }
  } else if (card.state === State.Learning || card.state === State.Relearning) {
    color = "var(--color-blue, #3b82f6)";
    bgColor = "rgba(59, 130, 246, 0.12)";
    label = "🧠 Learning";
  } else {
    color = "var(--text-muted)";
    bgColor = "var(--background-modifier-border)";
    label = "🧠 New";
  }

  span.style.color = color;
  span.style.backgroundColor = bgColor;
  span.innerText = label;

  const dueStr = card.due.toISOString().split('T')[0];
  const sStr = card.stability.toFixed(2);
  const dStr = card.difficulty.toFixed(2);
  span.title = `Due: ${dueStr} | S: ${sStr} | D: ${dStr} | Reps: ${card.reps}`;

  return span;
}

export function createDrillBadgeDOM(drillString: string): HTMLElement {
  const span = document.createElement("span");
  span.className = "drill-indicator";
  span.style.fontSize = "0.75em";
  span.style.cursor = "help";
  span.style.margin = "0 6px";
  span.style.padding = "2px 8px";
  span.style.borderRadius = "10px";
  span.style.verticalAlign = "text-bottom";
  span.style.fontWeight = "bold";

  const match = /<!--DRILL:([A-Za-z0-9_-]+)\|(completed|uncompleted)\|(\d+)\|(\d+)-->/.exec(drillString);
  if (!match) {
    span.style.color = "var(--text-muted)";
    span.style.border = "1px solid var(--text-faint)";
    span.innerText = "🎯 Drill";
    return span;
  }

  const isCompleted = match[2] === 'completed';
  const attempts = parseInt(match[3], 10) || 0;
  const attemptsText = attempts === 1 ? '1 attempt' : `${attempts} attempts`;

  if (isCompleted) {
    span.style.color = "var(--color-green, #22c55e)";
    span.style.backgroundColor = "rgba(34, 197, 94, 0.12)";
    span.innerText = `🎯 Completed (${attemptsText})`;
    span.title = `Drill passed after ${attemptsText}`;
  } else {
    span.style.color = "var(--color-orange, #f97316)";
    span.style.backgroundColor = "rgba(249, 115, 22, 0.12)";
    span.innerText = `🎯 Incomplete (${attemptsText})`;
    span.title = `Drill attempted (${attemptsText}), not yet completed`;
  }

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

class DrillIconWidget extends WidgetType {
  private drillString: string;

  constructor(drillString: string) {
    super();
    this.drillString = drillString;
  }

  toDOM() {
    return createDrillBadgeDOM(this.drillString);
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

    if (update.selectionSet || update.docChanged) {
      const activeFile = app.workspace.getActiveFile();
      if (activeFile && cacheManager.hasUnborn(activeFile.path)) {
        const ranges = cacheManager.getUnbornRanges(activeFile.path);
        if (ranges.length > 0) {
          const cursorLine = update.state.doc.lineAt(update.state.selection.main.head).number;
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
      
      // 1. FSRS comments
      const fsrsRegex = /<!--FSRS:([A-Za-z0-9_-]+)\|(\d{8,14})\|([\d.]+)\|([\d.]+)\|(\d+)\|(\d+)\|(\d+)-->/g;
      let match;
      const matches: { from: number; to: number; widget: WidgetType }[] = [];

      while ((match = fsrsRegex.exec(text)) !== null) {
        matches.push({
          from: from + match.index,
          to: from + match.index + match[0].length,
          widget: new FSRSIconWidget(match[0], settings)
        });
      }

      // 2. DRILL comments
      const drillRegex = /<!--DRILL:([A-Za-z0-9_-]+)\|(completed|uncompleted)\|(\d+)\|(\d+)-->/g;
      while ((match = drillRegex.exec(text)) !== null) {
        matches.push({
          from: from + match.index,
          to: from + match.index + match[0].length,
          widget: new DrillIconWidget(match[0])
        });
      }

      // Sort by start position for RangeSetBuilder
      matches.sort((a, b) => a.from - b.from);

      for (const m of matches) {
        builder.add(
          m.from,
          m.to,
          Decoration.replace({
            widget: m.widget
          })
        );
      }
    }
    return builder.finish();
  }
}, {
  decorations: v => v.decorations
});
