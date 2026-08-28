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

      const optionLines = back.split('\n').filter(line => /^\s*-\s*\[[ xX]\]/.test(line));
      let type: DrillType = 'standard';
      const options: MultipleChoiceOption[] = [];

      if (optionLines.length > 0) {
        type = 'multiple-choice';
        for (const line of optionLines) {
          const isCorrect = /^\s*-\s*\[[xX]\]/.test(line);
          const optionText = line.replace(/^\s*-\s*\[[ xX]\]\s*/, '').trim();
          options.push({ text: optionText, isCorrect });
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
