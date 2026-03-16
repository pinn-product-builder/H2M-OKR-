import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useSectors,
  useCycles,
  useUpdateObjective,
  useUpdateKeyResult,
  useCreateKeyResult,
  useProfiles,
  useObjectives,
} from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Target, Loader2, Pencil } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Objective, KeyResult } from '@/types/okr';

const keyResultSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(200),
  type: z.enum(['numeric', 'percentage']),
  currentValue: z.coerce.number().min(0),
  target: z.coerce.number().min(0, 'Meta deve ser positiva'),
  baseline: z.coerce.number().min(0),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  ownerId: z.string().min(1, 'Responsável é obrigatório'),
});

const editOKRSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(20).max(500),
  sector: z.string().min(1),
  ownerId: z.string().min(1),
  period: z.string().min(1),
  priority: z.enum(['high', 'medium', 'low']),
  okrType: z.enum(['strategic', 'tactical', 'operational']),
  parentId: z.string().optional(),
  keyResults: z.array(keyResultSchema).min(1).max(5),
});

type EditOKRData = z.infer<typeof editOKRSchema>;

interface EditOKRFormProps {
  objective: Objective;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rawObjective?: {
    owner_id?: string;
    cycle_id?: string;
    sector_id?: string;
    okr_type?: string;
    parent_id?: string;
    key_results?: Array<{
      id: string;
      title: string;
      type: string;
      current_value: number;
      target_value: number;
      baseline_value: number;
      unit?: string;
      owner_id?: string;
    }>;
  };
}

const priorityOptions = [
  { value: 'high', label: 'Alta', color: 'text-critical' },
  { value: 'medium', label: 'Média', color: 'text-warning' },
  { value: 'low', label: 'Baixa', color: 'text-muted-foreground' },
];

const okrTypeOptions = [
  { value: 'strategic', label: 'Estratégico' },
  { value: 'tactical', label: 'Tático' },
  { value: 'operational', label: 'Operacional' },
];

const allowedParentTypes: Record<string, string> = {
  tactical: 'strategic',
  operational: 'tactical',
};

export function EditOKRForm({ objective, open, onOpenChange, rawObjective }: EditOKRFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletedKRIds, setDeletedKRIds] = useState<string[]>([]);

  const { data: sectors = [] } = useSectors();
  const { data: cycles = [] } = useCycles();
  const { data: profiles = [] } = useProfiles();
  const { data: allObjectives = [] } = useObjectives();
  const updateObjective = useUpdateObjective();
  const updateKeyResult = useUpdateKeyResult();
  const createKeyResult = useCreateKeyResult();

  const activeCycles = cycles.filter(c => !c.is_archived);

  const krMapper = (krs: any[]) => krs.map((kr: any) => ({
    id: kr.id,
    title: kr.title,
    type: (('type' in kr ? kr.type : 'numeric') as 'numeric' | 'percentage'),
    currentValue: 'current_value' in kr ? kr.current_value : kr.current || 0,
    target: 'target_value' in kr ? kr.target_value : kr.target || 0,
    baseline: 'baseline_value' in kr ? kr.baseline_value : kr.baseline || 0,
    unit: kr.unit || '',
    ownerId: ('owner_id' in kr ? kr.owner_id : '') || '',
  }));

  const form = useForm<EditOKRData>({
    resolver: zodResolver(editOKRSchema),
    defaultValues: {
      title: objective.title,
      description: objective.description || '',
      sector: rawObjective?.sector_id || objective.sector || '',
      ownerId: rawObjective?.owner_id || '',
      period: rawObjective?.cycle_id || '',
      priority: objective.priority || 'medium',
      okrType: (rawObjective?.okr_type as any) || objective.okrType || 'operational',
      parentId: rawObjective?.parent_id || objective.parentId || '',
      keyResults: krMapper(rawObjective?.key_results || objective.keyResults || []),
    },
  });

  const watchedOkrType = form.watch('okrType');
  
  const availableParents = useMemo(() => {
    const requiredParentType = allowedParentTypes[watchedOkrType];
    if (!requiredParentType) return [];
    return allObjectives.filter(o => (o as any).okr_type === requiredParentType && o.id !== objective.id);
  }, [allObjectives, watchedOkrType, objective.id]);

  // Reset form when objective changes
  useEffect(() => {
    if (open) {
      setDeletedKRIds([]);
      form.reset({
        title: objective.title,
        description: objective.description || '',
        sector: rawObjective?.sector_id || objective.sector || '',
        ownerId: rawObjective?.owner_id || '',
        period: rawObjective?.cycle_id || '',
        priority: objective.priority || 'medium',
        okrType: (rawObjective?.okr_type as any) || objective.okrType || 'operational',
        parentId: rawObjective?.parent_id || objective.parentId || '',
        keyResults: krMapper(rawObjective?.key_results || objective.keyResults || []),
      });
    }
  }, [open, objective.id]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'keyResults',
  });

  const handleRemoveKR = (index: number) => {
    const kr = fields[index];
    if (kr && (kr as any).id) {
      setDeletedKRIds(prev => [...prev, (kr as any).id]);
    }
    remove(index);
  };

  const onSubmit = async (data: EditOKRData) => {
    setIsSubmitting(true);
    try {
      // Update objective
      await updateObjective.mutateAsync({
        id: objective.id,
        title: data.title,
        description: data.description,
        sector_id: data.sector,
        owner_id: data.ownerId,
        cycle_id: data.period,
        priority: data.priority,
        okr_type: data.okrType,
        parent_id: data.parentId || null,
      } as any);

      // Delete removed KRs
      for (const krId of deletedKRIds) {
        // Delete tasks first
        await supabase.from('tasks').delete().eq('key_result_id', krId);
        await supabase.from('key_results').delete().eq('id', krId);
      }

      // Update/create KRs
      for (const kr of data.keyResults) {
        if (kr.id) {
          // Update existing KR
          await updateKeyResult.mutateAsync({
            id: kr.id,
            title: kr.title,
            type: kr.type,
            current_value: kr.currentValue,
            target_value: kr.target,
            baseline_value: kr.baseline,
            unit: kr.unit,
            owner_id: kr.ownerId,
          });
        } else {
          // Create new KR
          await createKeyResult.mutateAsync({
            objective_id: objective.id,
            title: kr.title,
            type: kr.type,
            current_value: kr.currentValue,
            target_value: kr.target,
            baseline_value: kr.baseline,
            unit: kr.unit,
            owner_id: kr.ownerId,
            status: 'on-track',
          });
        }
      }

      toast({
        title: 'OKR atualizado',
        description: `"${data.title}" foi atualizado com sucesso.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao atualizar OKR',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-accent" />
            Editar OKR
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Objetivo */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Objetivo
              </h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setor *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o setor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sectors.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {profiles.map(p => (
                            <SelectItem key={p.user_id} value={p.user_id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciclo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activeCycles.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className={opt.color}>{opt.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Key Results */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Key Results ({fields.length}/5)
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ title: '', type: 'numeric', currentValue: 0, target: 0, baseline: 0, unit: '', ownerId: '' })}
                  disabled={fields.length >= 5}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar KR
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="border-dashed">
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          KR {index + 1} {(field as any).id ? '' : '(novo)'}
                        </span>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveKR(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name={`keyResults.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <FormField
                          control={form.control}
                          name={`keyResults.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="numeric">Numérico</SelectItem>
                                  <SelectItem value="percentage">Percentual</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`keyResults.${index}.baseline`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Baseline</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`keyResults.${index}.currentValue`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Atual</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`keyResults.${index}.target`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta *</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`keyResults.${index}.unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unidade *</FormLabel>
                              <FormControl>
                                <Input placeholder="R$, %, un" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`keyResults.${index}.ownerId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsável *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {profiles.map(p => (
                                  <SelectItem key={p.user_id} value={p.user_id}>{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="gradient-accent" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
