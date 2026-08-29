import { App, MarkdownRenderer, Component, setIcon, TFile } from 'obsidian';
import { nanoid } from 'nanoid';
import { CacheManager } from '../cache/cacheManager';
import { DrillCard } from '../cache/drillTypes';
import { playDrillComboSound, playFailSound } from '../audio';
import type SpacedRepetitionPlugin from '../main';

interface DrillTreeNode {
  _file?: boolean;
  path?: string;
  count: number;
  uncompleted: number;
  completed: number;
  children: Record<string, DrillTreeNode>;
}

export class DrillBrowseView {
  private containerEl: HTMLElement;
  private cacheManager: CacheManager;
  private onStartDrill: (path: string) => void;
  private expandedFolders: Record<string, boolean> = {};

  constructor(
    containerEl: HTMLElement,
    cacheManager: CacheManager,
    onStartDrill: (path: string) => void
  ) {
    this.containerEl = containerEl;
    this.cacheManager = cacheManager;
    this.onStartDrill = onStartDrill;

    this.render();
  }

  public render() {
    this.containerEl.empty();
    const wrapper = this.containerEl.createDiv('srf-drill-browse-container');

    const tree = this.buildTree();

    if (Object.keys(tree).length === 0) {
      const emptyDiv = wrapper.createDiv('srf-empty-state');
      emptyDiv.createEl('p', { text: 'No drills found in vault.' });
      const hint = emptyDiv.createEl('p', { cls: 'srf-hint' });
      hint.innerHTML = 'Tag any markdown file with <code>#drills</code> and add questions separated by <code>?</code>.';
      return;
    }

    const treeContainer = wrapper.createDiv('srf-tree-container');
    this.renderTree(treeContainer, tree, 0, '');
  }

  private buildTree(): Record<string, DrillTreeNode> {
    const root: Record<string, DrillTreeNode> = {};
    const drillsMap = this.cacheManager.getDrillsData();

    for (const filePath in drillsMap) {
      const drills = drillsMap[filePath];
      if (drills.length === 0) continue;

      const uncompletedCount = drills.filter((d) => !d.completed).length;
      const completedCount = drills.filter((d) => d.completed).length;

      const parts = filePath.split('/');
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;

        if (!current[part]) {
          current[part] = {
            _file: isFile,
            path: isFile ? filePath : undefined,
            count: 0,
            uncompleted: 0,
            completed: 0,
            children: {},
          };
        }

        if (isFile) {
          current[part].count = drills.length;
          current[part].uncompleted = uncompletedCount;
          current[part].completed = completedCount;
        }

        current = current[part].children;
      }
    }

    // Roll up folder counts
    const calculateTotals = (node: DrillTreeNode) => {
      if (node._file) return;
      let total = 0;
      let uncomp = 0;
      let comp = 0;
      for (const childKey in node.children) {
        const child = node.children[childKey];
        calculateTotals(child);
        total += child.count;
        uncomp += child.uncompleted;
        comp += child.completed;
      }
      node.count = total;
      node.uncompleted = uncomp;
      node.completed = comp;
    };

    for (const key in root) {
      calculateTotals(root[key]);
    }

    return root;
  }

  private renderTree(
    container: HTMLElement,
    nodes: Record<string, DrillTreeNode>,
    depth: number,
    pathPrefix: string
  ) {
    const keys = Object.keys(nodes);

    for (const key of keys) {
      const node = nodes[key];
      const itemEl = container.createDiv('srf-tree-item');
      itemEl.style.marginLeft = `${depth * 16}px`;

      if (node._file) {
        const row = itemEl.createDiv('srf-browser-row');
        const isAllDone = node.uncompleted === 0;

        const textLabel = isAllDone
          ? `✅ ${key} (${node.completed}/${node.count} completed)`
          : `🎯 ${key} (${node.uncompleted} remaining / ${node.count})`;

        const nameEl = row.createDiv({ cls: 'srf-file-name', text: textLabel });
        if (isAllDone) {
          nameEl.addClass('srf-completed-indicator');
        }

        const playBtn = row.createEl('button', {
          cls: 'srf-play-btn',
          title: isAllDone ? `All drills in ${key} completed` : `Start ${node.uncompleted} remaining drills in ${key}`,
          ariaLabel: `Start Drill ${key}`,
        });

        if (isAllDone) {
          setIcon(playBtn, 'check-check');
          playBtn.disabled = true;
        } else {
          setIcon(playBtn, 'play');
          playBtn.onclick = () => this.onStartDrill(node.path!);
        }
      } else {
        const newPrefix = pathPrefix ? `${pathPrefix}/${key}` : key;
        const isExpanded = !!this.expandedFolders[newPrefix];
        const isAllFolderDone = node.uncompleted === 0 && node.count > 0;

        const row = itemEl.createDiv('srf-browser-row');
        const folderHeader = row.createDiv('srf-folder-header');

        folderHeader.createSpan({
          cls: 'srf-tree-icon',
          text: isExpanded ? '📂' : '📁',
        });

        const folderText = isAllFolderDone
          ? `${key} (✅ All ${node.count} completed)`
          : `${key} (${node.uncompleted} remaining / ${node.count})`;

        folderHeader.createSpan({ text: folderText });
        if (isAllFolderDone) {
          folderHeader.addClass('srf-completed-indicator');
        }

        folderHeader.onclick = () => {
          this.expandedFolders[newPrefix] = !this.expandedFolders[newPrefix];
          this.render();
        };

        const playBtn = row.createEl('button', {
          cls: 'srf-play-btn',
          title: isAllFolderDone ? `All drills in folder completed` : `Start ${node.uncompleted} remaining drills in ${key}`,
          ariaLabel: `Start Drill Folder ${key}`,
        });

        if (isAllFolderDone) {
          setIcon(playBtn, 'check-check');
          playBtn.disabled = true;
        } else {
          setIcon(playBtn, 'play');
          playBtn.onclick = () => this.onStartDrill(newPrefix);
        }

        if (isExpanded) {
          this.renderTree(itemEl, node.children, depth + 1, newPrefix);
        }
      }
    }
  }
}

export class DrillSessionView {
  private containerEl: HTMLElement;
  private app: App;
  private cacheManager: CacheManager;
  private plugin: SpacedRepetitionPlugin;
  private parentComponent: Component;
  private folderPath: string;
  private onBack: () => void;

  private drills: DrillCard[] = [];
  private currentIndex = 0;
  private showAnswer = false;
  private selectedOptionIndices: Set<number> = new Set();
  private feedbackMessage: string | null = null;
  private isFinished = false;
  private currentCombo = 0;

  private startTime = Date.now();
  private elapsedTimeMs = 0;
  private timerInterval: any = null;
  private wasAutoStarted = false;

  constructor(
    containerEl: HTMLElement,
    app: App,
    cacheManager: CacheManager,
    plugin: SpacedRepetitionPlugin,
    parentComponent: Component,
    folderPath: string,
    onBack: () => void
  ) {
    this.containerEl = containerEl;
    this.app = app;
    this.cacheManager = cacheManager;
    this.plugin = plugin;
    this.parentComponent = parentComponent;
    this.folderPath = folderPath;
    this.onBack = onBack;

    this.loadDrills();
    this.startTimer();
    this.checkAutoStartPomodoro();
    this.render();
  }

  public destroy() {
    this.stopTimer();
    this.checkEndAutoPomodoro();
  }

  private getTaskTitle(): string {
    return 'Drills';
  }

  private checkAutoStartPomodoro() {
    try {
      const fcPlugin = (this.app as any).plugins?.plugins?.['focus-calendar-pomodoro'];
      if (fcPlugin) {
        if (typeof fcPlugin.startAutoDrillSession === 'function') {
          this.wasAutoStarted = fcPlugin.startAutoDrillSession();
        } else if (typeof fcPlugin.startAutoStudySession === 'function') {
          this.wasAutoStarted = fcPlugin.startAutoStudySession('Drills');
        }
      }
    } catch (e) {
      console.error('Failed to trigger Focus Calendar interlock', e);
    }
  }

  private checkEndAutoPomodoro() {
    const elapsedSec = Math.round(this.elapsedTimeMs / 1000);
    try {
      (this.app.workspace as any).trigger('spaced-repetition:drill-complete', {
        title: 'Drills',
        timeSec: elapsedSec,
      });

      const fcPlugin = (this.app as any).plugins?.plugins?.['focus-calendar-pomodoro'];
      if (fcPlugin && this.wasAutoStarted && typeof fcPlugin.endAutoStudySession === 'function') {
        fcPlugin.endAutoStudySession();
      }
    } catch (e) {
      console.error('Failed to end Focus Calendar interlock', e);
    }
  }

  private loadDrills() {
    const allDrillsMap = this.cacheManager.getDrillsData();
    const list: DrillCard[] = [];

    for (const filePath in allDrillsMap) {
      if (filePath === this.folderPath || filePath.startsWith(this.folderPath + '/')) {
        // ONLY include UNCOMPLETED drills - completed drills cannot be attempted again
        const uncompleted = allDrillsMap[filePath].filter((d) => !d.completed);
        list.push(...uncompleted);
      }
    }

    this.drills = list;
    this.currentIndex = 0;
    this.showAnswer = false;
    this.selectedOptionIndices = new Set();
    this.feedbackMessage = null;
    this.isFinished = this.drills.length === 0;
  }

  private startTimer() {
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      this.elapsedTimeMs = Date.now() - this.startTime;
      const timerEl = this.containerEl.querySelector('.srf-timer-badge');
      if (timerEl) {
        timerEl.textContent = `⏱️ ${this.formatTime(this.elapsedTimeMs)}`;
      }
    }, 200);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private async recordResult(passed: boolean) {
    const currentDrill = this.drills[this.currentIndex];
    if (!currentDrill) return;

    const timeSec = Math.round((Date.now() - this.startTime) / 1000);
    const attempts = (currentDrill.attempts || 0) + 1;
    const isCompleted = passed;
    const now = Date.now();

    const drillId = currentDrill.id.startsWith('drill-') ? nanoid(8) : currentDrill.id;
    const newStatus = isCompleted ? 'completed' : 'uncompleted';
    const newMetadataString = `<!--DRILL:${drillId}|${newStatus}|${attempts}|${now}-->`;

    // 1. Process and update Markdown Note in Vault
    const file = this.app.vault.getAbstractFileByPath(currentDrill.filePath);
    if (file instanceof TFile) {
      await this.app.vault.process(file, (data) => {
        // If previous raw DRILL comment is present, replace it
        if (currentDrill.rawMetadata && data.includes(currentDrill.rawMetadata)) {
          return data.replace(currentDrill.rawMetadata, newMetadataString);
        }

        // If another DRILL comment with this ID exists, replace it
        const exactRegex = new RegExp(`<!--DRILL:${drillId}\\|[^>]+-->`, 'g');
        if (exactRegex.test(data)) {
          return data.replace(exactRegex, newMetadataString);
        }

        // Otherwise append at the end of the question/answer block
        const qIdx = data.indexOf(currentDrill.question);
        if (qIdx !== -1) {
          const afterQ = data.substring(qIdx);
          const nextBlock = afterQ.search(/\n\s*\n/);
          if (nextBlock !== -1) {
            const insertPos = qIdx + nextBlock;
            return data.substring(0, insertPos) + '\n' + newMetadataString + data.substring(insertPos);
          }
        }
        return data + '\n' + newMetadataString;
      });
    }

    // 2. Update CacheManager in-memory store
    this.cacheManager.updateDrillData(currentDrill.filePath, currentDrill.id, {
      id: drillId,
      completed: isCompleted,
      attempts: attempts,
      lastCompletedAt: now,
      rawMetadata: newMetadataString,
    });

    currentDrill.id = drillId;
    currentDrill.completed = isCompleted;
    currentDrill.attempts = attempts;
    currentDrill.lastCompletedAt = now;
    currentDrill.rawMetadata = newMetadataString;

    // 3. Telemetry in Plugin Settings
    this.plugin.settings.drillTelemetry[drillId] = {
      completed: isCompleted,
      attempts: attempts,
      lastTimeSeconds: timeSec,
      lastCompletedAt: now,
    };

    await this.plugin.saveSettings();
  }

  private nextCard() {
    this.showAnswer = false;
    this.selectedOptionIndices = new Set();
    this.feedbackMessage = null;
    this.startTime = Date.now();

    if (this.currentIndex < this.drills.length - 1) {
      this.currentIndex++;
      this.render();
    } else {
      this.isFinished = true;
      this.stopTimer();
      this.render();
    }
  }

  public render() {
    this.containerEl.empty();
    const wrapper = this.containerEl.createDiv('srf-drill-session-wrapper');

    // Header
    const header = wrapper.createDiv('srf-drill-session-header');
    const backBtn = header.createEl('button', { cls: 'srf-back-btn', text: '← Back to Folders' });
    backBtn.onclick = () => this.onBack();

    header.createDiv({
      cls: 'srf-timer-badge',
      text: `⏱️ ${this.formatTime(this.elapsedTimeMs)}`,
    });

    if (this.isFinished) {
      const finishScreen = wrapper.createDiv('srf-finish-screen');
      const isAllDone = this.drills.length === 0;

      finishScreen.createEl('h2', {
        text: isAllDone ? '🎉 All Drills Already Completed!' : '🎉 Drill Session Completed!',
      });
      const p = finishScreen.createEl('p', {
        text: isAllDone
          ? 'No uncompleted drills remaining in this folder/file.'
          : 'Total time spent: ',
      });
      if (!isAllDone) {
        p.createEl('strong', { text: this.formatTime(this.elapsedTimeMs) });
      }

      const returnBtn = finishScreen.createEl('button', {
        cls: 'srf-action-btn srf-review-btn',
        text: 'Return to Folder Browser',
      });
      returnBtn.onclick = () => this.onBack();
      return;
    }

    const currentDrill = this.drills[this.currentIndex];
    if (!currentDrill) return;

    const card = wrapper.createDiv('srf-drill-card');

    // Meta
    const meta = card.createDiv('srf-drill-card-meta');
    meta.createSpan({ text: `Question ${this.currentIndex + 1} of ${this.drills.length}` });

    if (this.currentCombo > 0) {
      meta.createSpan({
        cls: 'srf-combo-badge',
        text: `🔥 Streak x${this.currentCombo}`,
      });
    }
    
    if (currentDrill.attempts > 0) {
      meta.createSpan({
        cls: 'srf-attempt-badge',
        text: `Attempt #${currentDrill.attempts + 1}`,
      });
    }

    meta.createSpan({
      cls: 'srf-type-tag',
      text: currentDrill.type === 'multiple-choice' ? 'Multiple Choice' : 'Q&A',
    });

    // Question
    const questionEl = card.createDiv('srf-drill-question');
    MarkdownRenderer.render(
      this.app,
      currentDrill.question,
      questionEl,
      currentDrill.filePath,
      this.parentComponent
    );

    // Multiple Choice vs Q&A
    if (currentDrill.type === 'multiple-choice') {
      const optionsGrid = card.createDiv('srf-options-grid');

      currentDrill.options.forEach((opt, idx) => {
        const isSelected = this.selectedOptionIndices.has(idx);
        const isCorrect = opt.isCorrect;

        let statusClass = '';
        if (this.showAnswer) {
          statusClass = isCorrect ? 'correct' : isSelected ? 'wrong' : '';
        } else if (isSelected) {
          statusClass = 'selected';
        }

        const optBtn = optionsGrid.createEl('button', {
          cls: `srf-option-btn ${statusClass}`,
          disabled: this.showAnswer,
        });

        optBtn.createSpan({ text: isSelected ? '☑ ' : '☐ ' });
        const textSpan = optBtn.createSpan();
        MarkdownRenderer.render(
          this.app,
          opt.text,
          textSpan,
          currentDrill.filePath,
          this.parentComponent
        );

        optBtn.onclick = () => {
          if (this.showAnswer) return;
          if (this.selectedOptionIndices.has(idx)) {
            this.selectedOptionIndices.delete(idx);
          } else {
            this.selectedOptionIndices.add(idx);
          }
          this.render();
        };
      });

      if (!this.showAnswer) {
        const submitBtn = card.createEl('button', {
          cls: 'srf-submit-btn',
          text: 'Submit Answer',
          disabled: this.selectedOptionIndices.size === 0,
        });
        submitBtn.onclick = async () => {
          this.showAnswer = true;
          const correctIndices = currentDrill.options
            .map((opt, idx) => (opt.isCorrect ? idx : -1))
            .filter((idx) => idx !== -1);

          const isAllCorrect =
            correctIndices.length === this.selectedOptionIndices.size &&
            correctIndices.every((idx) => this.selectedOptionIndices.has(idx));

          if (isAllCorrect) {
            this.currentCombo++;
            await playDrillComboSound(this.app, this.currentCombo);
            if (this.currentCombo > (this.plugin.settings.highestCombo || 0)) {
              this.plugin.settings.highestCombo = this.currentCombo;
              await this.plugin.saveSettings();
            }
            this.feedbackMessage = this.currentCombo > 1
              ? `🔥 Streak x${this.currentCombo}! Correct!`
              : '✅ Correct! Drill completed.';
            await this.recordResult(true);
          } else {
            this.currentCombo = 0;
            playFailSound();
            this.feedbackMessage = '❌ Incorrect. Review the correct option(s) below.';
            await this.recordResult(false);
          }
          this.render();
        };
      }
    } else {
      if (!this.showAnswer) {
        const showBtn = card.createEl('button', {
          cls: 'srf-submit-btn',
          text: 'Show Answer',
        });
        showBtn.onclick = () => {
          this.showAnswer = true;
          this.render();
        };
      }
    }

    if (this.showAnswer) {
      const ansSection = card.createDiv('srf-drill-answer-section');

      if (currentDrill.type === 'multiple-choice') {
        if (this.feedbackMessage) {
          ansSection.createDiv({
            cls: 'srf-feedback-banner',
            text: this.feedbackMessage,
          });
        }
        const evalBtns = ansSection.createDiv('srf-eval-buttons');
        const nextBtn = evalBtns.createEl('button', {
          cls: 'srf-eval-btn pass',
          text: 'Next Question →',
        });
        nextBtn.onclick = () => this.nextCard();
      } else {
        ansSection.createEl('h3', { cls: 'srf-drill-answer-title', text: 'Answer' });
        const ansEl = ansSection.createDiv('srf-drill-answer');
        MarkdownRenderer.render(
          this.app,
          currentDrill.answer,
          ansEl,
          currentDrill.filePath,
          this.parentComponent
        );

        const evalBtns = ansSection.createDiv('srf-eval-buttons');
        const failBtn = evalBtns.createEl('button', {
          cls: 'srf-eval-btn fail',
          text: '❌ Fail / Retry Later',
        });
        failBtn.onclick = async () => {
          this.currentCombo = 0;
          playFailSound();
          await this.recordResult(false);
          this.nextCard();
        };

        const passBtn = evalBtns.createEl('button', {
          cls: 'srf-eval-btn pass',
          text: '✅ Pass / Mark Completed',
        });
        passBtn.onclick = async () => {
          this.currentCombo++;
          await playDrillComboSound(this.app, this.currentCombo);
          if (this.currentCombo > (this.plugin.settings.highestCombo || 0)) {
            this.plugin.settings.highestCombo = this.currentCombo;
            await this.plugin.saveSettings();
          }
          await this.recordResult(true);
          this.nextCard();
        };
      }
    }
  }
}
