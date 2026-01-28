import { cn } from '@/lib/utils';
import { OKRStatus } from '@/types/okr';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: OKRStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig: Record<OKRStatus, { label: string; className: string; icon: React.ElementType }> = {
  'on-track': {
    label: 'No Prazo',
    className: 'status-on-track',
    icon: CheckCircle2,
  },
  'attention': {
    label: 'Atenção',
    className: 'status-attention',
    icon: AlertCircle,
  },
  'critical': {
    label: 'Crítico',
    className: 'status-critical',
    icon: XCircle,
  },
};

export function StatusBadge({ status, showIcon = true, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn(
      "status-badge", 
      config.className,
      size === 'sm' && "text-[10px] px-1.5 py-0.5 gap-1"
    )}>
      {showIcon && <Icon className={cn("w-3.5 h-3.5", size === 'sm' && "w-3 h-3")} />}
      {config.label}
    </span>
  );
}
