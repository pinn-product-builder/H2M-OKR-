import type { OKRStatus } from '@/types/okr';

interface TaskLike {
  status?: string;
}

export function calculateKRProgress(
  currentValue: number | null | undefined,
  targetValue: number | null | undefined,
  type?: string,
  tasks?: TaskLike[]
): number {
  if (tasks && tasks.length > 0) {
    const completed = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  }

  const current = currentValue ?? 0;
  const target = targetValue ?? 0;

  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / target) * 100)));
}

export function calculateOKRProgressFromKRs(
  keyResults: Array<{
    current_value?: number | null;
    target_value?: number | null;
    type?: string;
    weight?: number | null;
    tasks?: TaskLike[];
  }>
): number {
  if (!keyResults || keyResults.length === 0) return 0;

  const totalWeight = keyResults.reduce((sum, kr) => sum + (kr.weight ?? 1), 0);
  if (totalWeight === 0) return 0;

  const weightedSum = keyResults.reduce((sum, kr) => {
    const progress = calculateKRProgress(kr.current_value, kr.target_value, kr.type, kr.tasks);
    const weight = kr.weight ?? 1;
    return sum + progress * weight;
  }, 0);

  return Math.round(weightedSum / totalWeight);
}

export function getStatusFromProgress(progress: number): OKRStatus {
  if (progress >= 100) return 'completed';
  if (progress >= 70) return 'on-track';
  if (progress >= 40) return 'attention';
  return 'critical';
}
