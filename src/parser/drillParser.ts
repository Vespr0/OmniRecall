import { App, TFile } from 'obsidian';
import { DrillCard, MultipleChoiceOption, DrillType } from '../cache/drillTypes';

export const DRILL_REGEX = /<!--DRILL:([A-Za-z0-9_-]+)\|(completed|uncompleted)\|(\d+)\|(\d+)-->/;

export class DrillParser {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  public async parseFile(file: TFile, text: string): Promise<DrillCard[]> {
    const cache = this.app.metadataCache.getFileCache(file);
    let hasTag = false;

    if (cache?.tags) {
      hasTag = cache.tags.some(t => t.tag === '#drills' || t.tag.startsWith('#drills/'));
    }

    if (!hasTag && text.includes('#drills')) {
      hasTag = true;
    }

    if (!hasTag) return [];

    const drills: DrillCard[] = [];
    const blocks = text.split(/\n{2,}/);
    let currentOffset = 0;

    for (const block of blocks) {
      const blockStartIndex = text.indexOf(block, currentOffset);
      const blockEndIndex = blockStartIndex + block.length;
      currentOffset = blockEndIndex;

      const qIndex = block.indexOf('\n?\n');
      if (qIndex === -1) continue;

      const question = block.substring(0, qIndex).replace(/#drills/g, '').trim();
      let back = block.substring(qIndex + 3).trim();

      if (!question || !back) continue;

      // Extract in-markdown DRILL metadata comment if present
      let drillId = `drill-${file.path}-${blockStartIndex}`;
      let completed = false;
      let attempts = 0;
      let lastCompletedAt = 0;
      let rawMetadata: string | null = null;

      const drillMatch = DRILL_REGEX.exec(back);
      if (drillMatch) {
        drillId = drillMatch[1];
        completed = drillMatch[2] === 'completed';
        attempts = parseInt(drillMatch[3], 10) || 0;
        lastCompletedAt = parseInt(drillMatch[4], 10) || 0;
        rawMetadata = drillMatch[0];
        // Strip the DRILL comment from the answer body for clean rendering
        back = back.replace(drillMatch[0], '').trim();
      }

      const rawLines = back.split('\n');
      const parsedOptions: { text: string; isCorrect: boolean; isRadio: boolean }[] = [];

      for (const line of rawLines) {
        // Matches - [x], - [ ], - (x), - ( ), * [x], 1. [x], etc.
        const match = /^\s*(?:[-*]|\d+\.)\s*(?:\[([ xX])\]|\(([ xX])\))\s*(.*)/.exec(line);
        if (match) {
          const isRadio = match[2] !== undefined;
          const mark = isRadio ? match[2] : match[1];
          const isCorrect = mark.toLowerCase() === 'x';
          const optionText = match[3].trim();
          parsedOptions.push({ text: optionText, isCorrect, isRadio });
        }
      }

      let type: DrillType = 'standard';
      const options: MultipleChoiceOption[] = [];

      if (parsedOptions.length > 0) {
        const correctCount = parsedOptions.filter(o => o.isCorrect).length;
        const hasRadio = parsedOptions.some(o => o.isRadio);
        const combinedText = `${question}\n${back}`;
        const isExplicitSingle = /#(?:single|single-choice)\b|\[single\]/i.test(combinedText);
        const isExplicitMulti = /#(?:multi|multiple|multiple-choice)\b|\[multi\]|select all/i.test(combinedText);

        if (isExplicitSingle) {
          type = 'single-choice';
        } else if (isExplicitMulti) {
          type = 'multiple-choice';
        } else if (hasRadio) {
          type = 'single-choice';
        } else if (correctCount === 1) {
          type = 'single-choice';
        } else {
          type = 'multiple-choice';
        }

        for (const opt of parsedOptions) {
          options.push({ text: opt.text, isCorrect: opt.isCorrect });
        }
      }

      const folderPath = file.parent ? file.parent.path : '/';

      drills.push({
        id: drillId,
        filePath: file.path,
        folderPath,
        question,
        answer: back,
        type,
        options,
        completed,
        attempts,
        lastCompletedAt,
        rawMetadata,
        startIndex: blockStartIndex,
        endIndex: blockEndIndex
      });
    }

    return drills;
  }
}
