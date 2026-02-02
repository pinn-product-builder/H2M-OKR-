import { useState } from 'react';
import { ChevronDown, Check, Star, Bookmark, Plus, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useUserViews } from '@/hooks/useViews';
import type { ViewType, UserView } from '@/types/views';

interface ViewSelectorProps {
  type: ViewType;
  selectedViewId: string | null;
  onSelectView: (view: UserView | null) => void;
  onSaveView: () => void;
  onManageViews: () => void;
  hasUnsavedChanges?: boolean;
}

export function ViewSelector({
  type,
  selectedViewId,
  onSelectView,
  onSaveView,
  onManageViews,
  hasUnsavedChanges = false,
}: ViewSelectorProps) {
  const { data: views = [], isLoading } = useUserViews(type);
  const [open, setOpen] = useState(false);

  const selectedView = views.find(v => v.id === selectedViewId);
  const defaultView = views.find(v => v.is_default);

  const getDisplayLabel = () => {
    if (selectedView) {
      return (
        <span className="flex items-center gap-2">
          {selectedView.is_default && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
          {selectedView.name}
          {hasUnsavedChanges && <span className="text-xs text-muted-foreground">(modificado)</span>}
        </span>
      );
    }
    return 'Visualização padrão';
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 min-w-[180px] justify-between">
          <span className="flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            {isLoading ? 'Carregando...' : getDisplayLabel()}
          </span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        {/* Default option */}
        <DropdownMenuItem
          onClick={() => {
            onSelectView(null);
            setOpen(false);
          }}
          className="flex items-center gap-2"
        >
          {!selectedViewId && <Check className="w-4 h-4" />}
          {selectedViewId && <span className="w-4" />}
          <span>Visualização padrão</span>
        </DropdownMenuItem>

        {views.length > 0 && <DropdownMenuSeparator />}

        {/* Saved views */}
        {views.map(view => (
          <DropdownMenuItem
            key={view.id}
            onClick={() => {
              onSelectView(view);
              setOpen(false);
            }}
            className="flex items-center gap-2"
          >
            {selectedViewId === view.id ? (
              <Check className="w-4 h-4" />
            ) : (
              <span className="w-4" />
            )}
            <span className="flex-1 flex items-center gap-2">
              {view.is_default && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
              {view.name}
            </span>
            {view.is_shared && (
              <span className="text-xs text-muted-foreground">público</span>
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Actions */}
        <DropdownMenuItem onClick={onSaveView} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Salvar visualização atual
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onManageViews} className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Gerenciar visualizações
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
