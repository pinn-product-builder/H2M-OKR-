import { useState } from 'react';
import { Trash2, Star, StarOff, Share2, MoreVertical, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUserViews, useDeleteView, useSetDefaultView, useUpdateView } from '@/hooks/useViews';
import { toast } from 'sonner';
import type { ViewType, UserView } from '@/types/views';

interface ViewManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ViewType;
  onSelectView?: (view: UserView) => void;
}

export function ViewManager({
  open,
  onOpenChange,
  type,
  onSelectView,
}: ViewManagerProps) {
  const { data: views = [], isLoading } = useUserViews(type);
  const deleteView = useDeleteView();
  const setDefaultView = useSetDefaultView();
  const updateView = useUpdateView();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleSetDefault = async (view: UserView) => {
    try {
      await setDefaultView.mutateAsync({ viewId: view.id, type });
      toast.success(`"${view.name}" definida como padrão`);
    } catch (error) {
      toast.error('Erro ao definir como padrão');
    }
  };

  const handleToggleShared = async (view: UserView) => {
    try {
      await updateView.mutateAsync({
        id: view.id,
        is_shared: !view.is_shared,
      });
      toast.success(view.is_shared ? 'Visualização agora é privada' : 'Visualização compartilhada');
    } catch (error) {
      toast.error('Erro ao alterar compartilhamento');
    }
  };

  const handleRename = async (view: UserView) => {
    if (!editName.trim()) return;
    try {
      await updateView.mutateAsync({
        id: view.id,
        name: editName.trim(),
      });
      setEditingId(null);
      toast.success('Nome atualizado');
    } catch (error) {
      toast.error('Erro ao renomear');
    }
  };

  const handleDelete = async (view: UserView) => {
    try {
      await deleteView.mutateAsync({ id: view.id, type });
      setDeleteConfirmId(null);
      toast.success('Visualização excluída');
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const startEditing = (view: UserView) => {
    setEditingId(view.id);
    setEditName(view.name);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Visualizações</DialogTitle>
            <DialogDescription>
              Configure suas visualizações salvas de {type === 'okr' ? 'OKRs' : 'Dashboard'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            )}

            {!isLoading && views.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma visualização salva ainda.
              </div>
            )}

            {views.map(view => (
              <div
                key={view.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {editingId === view.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(view);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                      className="h-8"
                    />
                    <Button size="sm" onClick={() => handleRename(view)}>
                      Salvar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onSelectView?.(view);
                        onOpenChange(false);
                      }}
                      className="flex-1 text-left flex items-center gap-2"
                    >
                      {view.is_default && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                      <span className="font-medium">{view.name}</span>
                      {view.is_shared && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          público
                        </span>
                      )}
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEditing(view)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Renomear
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => handleSetDefault(view)}>
                          {view.is_default ? (
                            <>
                              <StarOff className="w-4 h-4 mr-2" />
                              Remover padrão
                            </>
                          ) : (
                            <>
                              <Star className="w-4 h-4 mr-2" />
                              Definir como padrão
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handleToggleShared(view)}>
                          <Share2 className="w-4 h-4 mr-2" />
                          {view.is_shared ? 'Tornar privada' : 'Compartilhar'}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => setDeleteConfirmId(view.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir visualização?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A visualização será permanentemente excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const view = views.find(v => v.id === deleteConfirmId);
                if (view) handleDelete(view);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
