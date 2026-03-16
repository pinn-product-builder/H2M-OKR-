import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, GitBranch } from 'lucide-react';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

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

  // Create nodes
  for (const obj of objectives) {
    map.set(obj.id, {
      id: obj.id,
      title: obj.title,
      okrType: obj.okr_type || 'operational',
      progress: obj._calculatedProgress ?? obj.progress ?? 0,
      status: obj._calculatedStatus ?? obj.status ?? 'on-track',
      sectorName: getSectorLabel(obj.sector_id),
      ownerName: obj.owner?.name || '',
      krCount: obj.key_results?.length || 0,
      children: [],
    });
  }

  // Build hierarchy
  for (const obj of objectives) {
    const node = map.get(obj.id)!;
    if (obj.parent_id && map.has(obj.parent_id)) {
      map.get(obj.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort: strategic first, then tactical, then operational
  const typeOrder = { strategic: 0, tactical: 1, operational: 2 };
  const sortFn = (a: TreeObjective, b: TreeObjective) =>
    (typeOrder[a.okrType as keyof typeof typeOrder] ?? 2) - (typeOrder[b.okrType as keyof typeof typeOrder] ?? 2);
  
  roots.sort(sortFn);
  for (const node of map.values()) {
    node.children.sort(sortFn);
  }

  return roots;
}

function TreeNode({ node, depth, onSelect, objectivesMap }: { 
  node: TreeObjective; 
  depth: number; 
  onSelect: (obj: any) => void;
  objectivesMap: Map<string, any>;
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
        onClick={() => onSelect(objectivesMap.get(node.id))}
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
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              objectivesMap={objectivesMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function OKRTreeView({ objectives, onSelect, getSectorLabel }: OKRTreeViewProps) {
  const tree = useMemo(() => buildTree(objectives, getSectorLabel), [objectives, getSectorLabel]);
  
  const objectivesMap = useMemo(() => {
    const map = new Map<string, any>();
    for (const obj of objectives) map.set(obj.id, obj);
    return map;
  }, [objectives]);

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
    <div className="space-y-2">
      {tree.map(node => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          onSelect={onSelect}
          objectivesMap={objectivesMap}
        />
      ))}
    </div>
  );
}
