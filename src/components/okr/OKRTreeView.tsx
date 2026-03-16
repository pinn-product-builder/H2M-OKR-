import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, GitBranch } from 'lucide-react';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { OKRDetailModal } from '@/components/okr/OKRDetailModal';
import { calculateOKRProgressFromKRs, calculateKRProgress, getStatusFromProgress } from '@/lib/okr-calculations';

interface TreeObjective {
  id: string;
  title: string;
  okrType: string;
  progress: number;
  status: string;
  sectorName: string;
  ownerName: string;
  krCount: number;
  children: TreeObjective[];
}

interface OKRTreeViewProps {
  objectives: any[];
  onSelect: (objective: any) => void;
  getSectorLabel: (sectorId?: string) => string;
}

const typeLabels: Record<string, string> = {
  strategic: 'Estratégico',
  tactical: 'Tático',
  operational: 'Operacional',
};

const typeStyles: Record<string, string> = {
  strategic: 'bg-primary/10 text-primary border-primary/20',
  tactical: 'bg-warning/10 text-warning border-warning/20',
  operational: 'bg-muted text-muted-foreground border-border',
};

function buildTree(objectives: any[], getSectorLabel: (id?: string) => string): TreeObjective[] {
  const map = new Map<string, TreeObjective>();
  const roots: TreeObjective[] = [];

  for (const obj of objectives) {
    const krs = obj.key_results || [];
    const progress = calculateOKRProgressFromKRs(krs);
    map.set(obj.id, {
      id: obj.id,
      title: obj.title,
      okrType: obj.okr_type || 'operational',
      progress,
      status: getStatusFromProgress(progress),
      sectorName: getSectorLabel(obj.sector_id),
      ownerName: obj.owner?.name || '',
      krCount: krs.length,
      children: [],
    });
  }

  for (const obj of objectives) {
    const node = map.get(obj.id)!;
    if (obj.parent_id && map.has(obj.parent_id)) {
      map.get(obj.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const typeOrder = { strategic: 0, tactical: 1, operational: 2 };
  const sortFn = (a: TreeObjective, b: TreeObjective) =>
    (typeOrder[a.okrType as keyof typeof typeOrder] ?? 2) - (typeOrder[b.okrType as keyof typeof typeOrder] ?? 2);
  
  roots.sort(sortFn);
  for (const node of map.values()) {
    node.children.sort(sortFn);
  }

  return roots;
}

function mapToDisplayObjective(obj: any, cycleName: string) {
  const krs = obj.key_results || [];
  const okrProgress = calculateOKRProgressFromKRs(krs);
  return {
    id: obj.id,
    title: obj.title,
    description: obj.description || '',
    sector: obj.sector_id || '',
    owner: obj.owner?.name || '',
    period: cycleName,
    priority: (obj.priority as 'high' | 'medium' | 'low') || 'medium',
    okrType: obj.okr_type,
    progress: okrProgress,
    status: getStatusFromProgress(okrProgress) as any,
    createdAt: obj.created_at,
    updatedAt: obj.updated_at,
    keyResults: krs.map((kr: any) => {
      const krProgress = calculateKRProgress(kr.current_value, kr.target_value, kr.type, kr.tasks);
      return {
        id: kr.id,
        title: kr.title,
        type: kr.type as any,
        current: kr.current_value,
        target: kr.target_value,
        baseline: kr.baseline_value ?? 0,
        unit: kr.unit || '',
        owner: kr.owner?.name || '',
        progress: krProgress,
        status: getStatusFromProgress(krProgress) as any,
        lastUpdate: kr.updated_at,
        tasks: (kr.tasks || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          assignedTo: t.assignee_id || '',
          assignedToName: t.assignee?.name || '',
          dueDate: t.due_date,
          priority: t.priority as any,
          status: t.status as any,
          createdAt: t.created_at,
          completedAt: t.completed_at,
          parentKRId: t.key_result_id,
          parentOKRId: obj.id,
        })),
      };
    }),
  };
}

function TreeNode({ node, depth, onSelect }: { 
  node: TreeObjective; 
  depth: number; 
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg cursor-pointer group transition-colors",
          "hover:bg-accent/5 border border-transparent hover:border-accent/20",
          depth === 0 && "bg-card shadow-sm border-border",
        )}
        style={{ marginLeft: depth * 24 }}
        onClick={() => onSelect(node.id)}
      >
        {depth > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground/40">
            <GitBranch className="w-3.5 h-3.5" />
          </div>
        )}
        
        <span className={cn(
          "text-[10px] font-semibold px-1.5 py-0.5 rounded-md border shrink-0",
          typeStyles[node.okrType] || typeStyles.operational,
        )}>
          {typeLabels[node.okrType] || 'Operacional'}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">
            {node.title}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span>{node.sectorName}</span>
            {node.ownerName && <span>• {node.ownerName}</span>}
            <span>• {node.krCount} KRs</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="w-24">
            <ProgressBar progress={node.progress} status={node.status as any} showLabel size="sm" />
          </div>
          <StatusBadge status={node.status as any} size="sm" />
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
        </div>
      </div>

      {node.children.length > 0 && (
        <div className="mt-1 space-y-1">
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export function OKRTreeView({ objectives, onSelect, getSectorLabel }: OKRTreeViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const tree = useMemo(() => buildTree(objectives, getSectorLabel), [objectives, getSectorLabel]);
  
  const objectivesMap = useMemo(() => {
    const map = new Map<string, any>();
    for (const obj of objectives) map.set(obj.id, obj);
    return map;
  }, [objectives]);

  const selectedRaw = selectedId ? objectivesMap.get(selectedId) : null;
  const selectedDisplay = selectedRaw ? mapToDisplayObjective(selectedRaw, '') : null;

  if (tree.length === 0) {
    return (
      <div className="card-elevated p-8 text-center text-muted-foreground">
        <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum OKR com hierarquia encontrada.</p>
        <p className="text-sm">Vincule OKRs táticos a estratégicos e operacionais a táticos.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {tree.map(node => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            onSelect={(id) => setSelectedId(id)}
          />
        ))}
      </div>
      
      {selectedDisplay && (
        <OKRDetailModal
          objective={selectedDisplay}
          open={!!selectedId}
          onOpenChange={(open) => { if (!open) setSelectedId(null); }}
          rawObjective={selectedRaw}
        />
      )}
    </>
  );
}
