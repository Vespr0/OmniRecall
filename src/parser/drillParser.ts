import { App, TFile } from 'obsidian';
import { DrillCard, MultipleChoiceOption, DrillType } from '../cache/drillTypes';

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
      const back = block.substring(qIndex + 3).trim();

      if (!question || !back) continue;

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
      const cardId = `drill-${file.path}-${blockStartIndex}`;

      drills.push({
        id: cardId,
        filePath: file.path,
        folderPath,
        question,
        answer: back,
        type,
        options,
        startIndex: blockStartIndex,
        endIndex: blockEndIndex
      });
    }

    return drills;
  }
}
