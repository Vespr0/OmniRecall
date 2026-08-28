export type DrillType = 'standard' | 'multiple-choice';
export type DrillStatus = 'completed' | 'uncompleted';

export interface MultipleChoiceOption {
  text: string;
  isCorrect: boolean;
}

export interface DrillCard {
  id: string;
  filePath: string;
  folderPath: string;
  question: string;
  answer: string;
  type: DrillType;
  options: MultipleChoiceOption[];
  completed: boolean;
  attempts: number;
  lastCompletedAt: number;
  rawMetadata?: string | null;
  startIndex: number;
  endIndex: number;
}

export interface DrillTelemetry {
  completed: boolean;
  attempts: number;
  lastTimeSeconds: number;
  lastCompletedAt: number;
}

export type DrillTelemetryRecord = Record<string, DrillTelemetry>;
