
export enum AppTheme {
  DARK = 'dark',
  LIGHT = 'light',
  NEBULA = 'nebula',
  FOREST = 'forest'
}

export type Language = 'en' | 'zh';

export interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

export interface ChartData {
  label: string;
  value: number;
}

export interface ExperimentStep {
  id: number;
  title: string;
  instruction: string;
  action: string;
  visualEffect: 'flame' | 'smoke' | 'water_rise' | 'color_change' | 'bubbles' | 'none';
  observation: string;
  equation?: string;
  chemicalFormula?: string;
  materialName?: string; // 新增：具体的试剂/材料名称
  targetComponent?: 'vessel' | 'tool' | 'liquid' | 'surface';
  liquidColor?: string;
}

export interface Experiment {
  title: string;
  objective: string;
  vesselType: 'jar' | 'beaker' | 'test_tube';
  toolType: 'spoon' | 'dropper' | 'stirrer' | 'none';
  initialLiquidColor?: string;
  equipment: string[];
  chemicals: string[];
  steps: ExperimentStep[];
  conclusion: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface AppState {
  theme: AppTheme;
  language: Language;
  tasks: Task[];
  chart: {
    data: ChartData[];
    type: 'bar' | 'line';
    title: string;
  } | null;
  experiment: Experiment | null;
  history: {
    command: string;
    response: string;
    timestamp: number;
    grounding?: GroundingChunk[];
  }[];
}
