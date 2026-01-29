import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SYSTEM_FIELDS, TRANSFORMATION_TYPES } from '@/types/dataHub';

interface MappingRow {
  id: string;
  sourceColumn: string;
  targetField: string;
  transformation: string;
}

interface NewSourceWithMappingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    targetTable: string;
    mappings: MappingRow[];
  }) => void;
}

const TARGET_TABLES = [
  { value: 'faturamento_mensal', label: 'Faturamento Mensal' },
  { value: 'custos_operacionais', label: 'Custos Operacionais' },
  { value: 'estoque', label: 'Estoque' },
  { value: 'leads_marketing', label: 'Leads Marketing' },
  { value: 'metas_vendas', label: 'Metas de Vendas' },
  { value: 'dre', label: 'DRE' },
];

export function NewSourceWithMapping({ open, onOpenChange, onSubmit }: NewSourceWithMappingProps) {
  const [sourceName, setSourceName] = useState('');
  const [targetTable, setTargetTable] = useState('');
  const [mappings, setMappings] = useState<MappingRow[]>([
    { id: '1', sourceColumn: '', targetField: '', transformation: 'none' },
  ]);

  const handleAddMapping = () => {
    setMappings(prev => [
      ...prev,
      { id: Date.now().toString(), sourceColumn: '', targetField: '', transformation: 'none' },
    ]);
  };

  const handleRemoveMapping = (id: string) => {
    if (mappings.length === 1) return;
    setMappings(prev => prev.filter(m => m.id !== id));
  };

  const handleMappingChange = (id: string, field: keyof MappingRow, value: string) => {
    setMappings(prev => prev.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleSubmit = () => {
    if (!sourceName.trim()) {
      toast({ title: 'Erro', description: 'Nome da fonte é obrigatório.', variant: 'destructive' });
      return;
    }
    if (!targetTable) {
      toast({ title: 'Erro', description: 'Selecione uma tabela de destino.', variant: 'destructive' });
      return;
    }

    // Filter out empty mappings
    const validMappings = mappings.filter(m => m.sourceColumn && m.targetField);

    onSubmit({
      name: sourceName,
      targetTable,
      mappings: validMappings,
    });

    // Reset form
    setSourceName('');
    setTargetTable('');
    setMappings([{ id: '1', sourceColumn: '', targetField: '', transformation: 'none' }]);
    onOpenChange(false);
  };

  const handleClose = () => {
    setSourceName('');
    setTargetTable('');
    setMappings([{ id: '1', sourceColumn: '', targetField: '', transformation: 'none' }]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Fonte de Dados</DialogTitle>
          <DialogDescription>
            Configure uma nova planilha com mapeamento de campos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source-name">Nome da Fonte *</Label>
              <Input
                id="source-name"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="Ex: Planilha Vendas Q1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-table">Tabela de Destino *</Label>
              <Select value={targetTable} onValueChange={setTargetTable}>
                <SelectTrigger id="target-table">
                  <SelectValue placeholder="Selecione a tabela" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_TABLES.map(table => (
                    <SelectItem key={table.value} value={table.value}>
                      {table.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mapping Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Mapeamento de Colunas</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMapping}
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[35%]">Coluna do Arquivo</TableHead>
                    <TableHead className="w-[35%]">Campo do Sistema</TableHead>
                    <TableHead className="w-[20%]">Transformação</TableHead>
                    <TableHead className="w-[10%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell className="p-2">
                        <Input
                          value={mapping.sourceColumn}
                          onChange={(e) => handleMappingChange(mapping.id, 'sourceColumn', e.target.value)}
                          placeholder="Ex: valor_total"
                          className="h-9"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Select
                          value={mapping.targetField}
                          onValueChange={(value) => handleMappingChange(mapping.id, 'targetField', value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione o campo" />
                          </SelectTrigger>
                          <SelectContent>
                            {SYSTEM_FIELDS.map(field => (
                              <SelectItem key={field.id} value={field.id}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-2">
                        <Select
                          value={mapping.transformation}
                          onValueChange={(value) => handleMappingChange(mapping.id, 'transformation', value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TRANSFORMATION_TYPES.map(t => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveMapping(mapping.id)}
                          disabled={mappings.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <p className="text-sm text-muted-foreground">
              Configure as colunas que serão mapeadas do arquivo para os campos do sistema.
              O mapeamento pode ser ajustado posteriormente durante a importação.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="gradient-accent">
              Criar Fonte
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
