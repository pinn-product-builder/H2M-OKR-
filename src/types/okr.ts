export type OKRStatus = 'on-track' | 'attention' | 'critical' | 'completed';

export type KRType = 'numeric' | 'percentage';

export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';

// Dynamic sector configuration
export interface SectorConfig {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  createdAt: string;
  createdBy: string;
}

// Task interface (formerly Sub-KR)
export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedToName: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  parentKRId: string;
  parentOKRId: string;
}

export interface KeyResult {
  id: string;
  title: string;
  type: KRType;
  current: number;
  target: number;
  baseline: number;
  unit: string;
  owner: string;
  progress: number;
  status: OKRStatus;
  lastUpdate: string;
  parentId?: string;
  children?: KeyResult[];
  tasks?: Task[];
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  sector: string;
  owner: string;
  period: string;
  priority: 'high' | 'medium' | 'low';
  keyResults: KeyResult[];
  progress: number;
  status: OKRStatus;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
  archivedAt?: string;
}

export interface MetricCard {
  id: string;
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: string;
  variant: 'primary' | 'accent' | 'success' | 'warning' | 'critical';
}

export interface SectorSummary {
  sector: string;
  label: string;
  totalOKRs: number;
  avgProgress: number;
  onTrack: number;
  attention: number;
  critical: number;
}

export interface OKRCycle {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
}
