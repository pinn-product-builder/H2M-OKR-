import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCreateView } from '@/hooks/useViews';
import { toast } from 'sonner';
import type { ViewType, OKRViewFilters, DashboardLayout } from '@/types/views';

const saveViewSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Máximo 50 caracteres'),
  is_default: z.boolean(),
  is_shared: z.boolean(),
});

type SaveViewFormData = z.infer<typeof saveViewSchema>;

interface SaveViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ViewType;
  filters: OKRViewFilters | DashboardLayout;
  layout?: DashboardLayout;
  onSuccess?: () => void;
}

export function SaveViewDialog({
  open,
  onOpenChange,
  type,
  filters,
  layout,
  onSuccess,
}: SaveViewDialogProps) {
  const createView = useCreateView();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SaveViewFormData>({
    resolver: zodResolver(saveViewSchema),
    defaultValues: {
      name: '',
      is_default: false,
      is_shared: false,
    },
  });

  const isDefault = watch('is_default');
  const isShared = watch('is_shared');

  const onSubmit = async (data: SaveViewFormData) => {
    try {
      await createView.mutateAsync({
        name: data.name,
        type,
        filters,
        layout: layout || {},
        is_default: data.is_default,
        is_shared: data.is_shared,
      });
      
      toast.success('Visualização salva com sucesso!');
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Erro ao salvar visualização');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Salvar Visualização</DialogTitle>
            <DialogDescription>
              Salve os filtros atuais como uma visualização personalizada para acesso rápido.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da visualização</Label>
              <Input
                id="name"
                placeholder="Ex: Meus OKRs Comerciais"
                {...register('name')}
              />
              {errors.name && (
                <span className="text-sm text-destructive">{errors.name.message}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_default">Definir como padrão</Label>
                <p className="text-sm text-muted-foreground">
                  Carrega automaticamente ao abrir
                </p>
              </div>
              <Switch
                id="is_default"
                checked={isDefault}
                onCheckedChange={(checked) => setValue('is_default', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_shared">Compartilhar com a organização</Label>
                <p className="text-sm text-muted-foreground">
                  Gestores poderão ver esta visualização
                </p>
              </div>
              <Switch
                id="is_shared"
                checked={isShared}
                onCheckedChange={(checked) => setValue('is_shared', checked)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createView.isPending}>
              {createView.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
