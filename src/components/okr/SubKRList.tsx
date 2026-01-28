import { KeyResult } from '@/types/okr';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { ChevronDown, ChevronRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SubKRListProps {
  keyResults: KeyResult[];
  level?: number;
}

interface SubKRItemProps {
  kr: KeyResult;
  level: number;
}

function SubKRItem({ kr, level }: SubKRItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = kr.children && kr.children.length > 0;

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg transition-colors",
          "hover:bg-muted/50 cursor-pointer",
          level > 0 && "ml-4 border-l-2 border-muted pl-3"
        )}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {hasChildren ? (
          <button className="p-0.5 hover:bg-muted rounded">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium truncate">{kr.title}</p>
            <StatusBadge status={kr.status} size="sm" />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{kr.owner}</span>
            </div>
            <span>
              {kr.current} / {kr.target} {kr.unit}
            </span>
          </div>
        </div>

        <div className="w-20 flex-shrink-0">
          <ProgressBar progress={kr.progress} status={kr.status} size="sm" />
        </div>

        <span
          className={cn(
            "text-sm font-semibold min-w-[3rem] text-right",
            kr.status === 'on-track' && "text-success",
            kr.status === 'attention' && "text-warning",
            kr.status === 'critical' && "text-critical"
          )}
        >
          {kr.progress}%
        </span>
      </div>

      {hasChildren && isExpanded && (
        <div className="animate-fade-in">
          {kr.children!.map((childKr) => (
            <SubKRItem key={childKr.id} kr={childKr} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SubKRList({ keyResults, level = 0 }: SubKRListProps) {
  return (
    <div className="space-y-1">
      {keyResults.map((kr) => (
        <SubKRItem key={kr.id} kr={kr} level={level} />
      ))}
    </div>
  );
}
