import { cn } from '@/lib/utils';
import { OKRStatus } from '@/types/okr';
import { getStatusFromProgress } from '@/lib/okr-calculations';

interface ProgressBarProps {
  progress: number;
  status?: OKRStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const statusColors: Record<OKRStatus, string> = {
  'completed': 'gradient-success',
  'on-track': 'gradient-success',
  'attention': 'gradient-warning',
  'critical': 'gradient-critical',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({ 
  progress, 
  status, 
  size = 'md', 
  showLabel = false,
  animated = true 
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const resolvedStatus = status ?? getStatusFromProgress(clampedProgress);
  
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-muted-foreground">Progresso</span>
          <span className={cn(
            "text-xs font-semibold tabular-nums",
            (resolvedStatus === 'on-track' || resolvedStatus === 'completed') && "text-success",
            resolvedStatus === 'attention' && "text-warning",
            resolvedStatus === 'critical' && "text-critical"
          )}>
            {clampedProgress}%
          </span>
        </div>
      )}
      <div className={cn("progress-bar", sizeClasses[size])}>
        <div 
          className={cn(
            "progress-bar-fill",
            statusColors[resolvedStatus],
            animated && "animate-progress"
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
