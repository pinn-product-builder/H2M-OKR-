import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Database, X } from 'lucide-react';

export interface DataRow {
  [key: string]: string | number | null;
}

interface DataPreviewTableProps {
  data: DataRow[];
  columns: string[];
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DataPreviewTable({ 
  data, 
  columns, 
  fileName, 
  onConfirm, 
  onCancel,
  isLoading = false 
}: DataPreviewTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [targetTable, setTargetTable] = useState('');
  const rowsPerPage = 10;
  
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = currentPage * rowsPerPage;
  const visibleData = data.slice(startIndex, startIndex + rowsPerPage);

  const detectColumnType = (column: string): 'text' | 'number' | 'date' | 'currency' => {
    const sampleValues = data.slice(0, 10).map(row => row[column]).filter(v => v !== null && v !== '');
    
    if (sampleValues.length === 0) return 'text';
    
    // Check if all values are numbers
    const allNumbers = sampleValues.every(v => !isNaN(Number(v)));
    if (allNumbers) {
      // Check if looks like currency (large numbers)
      const numericValues = sampleValues.map(v => Number(v));
      const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      if (avg > 100) return 'currency';
      return 'number';
    }
    
    // Check if date-like
    const datePattern = /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/;
    const allDates = sampleValues.every(v => datePattern.test(String(v)));
    if (allDates) return 'date';
    
    return 'text';
  };

  const formatValue = (value: string | number | null, type: string): string => {
    if (value === null || value === '') return '-';
    
    if (type === 'currency') {
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(Number(value));
    }
    
    if (type === 'number') {
      return new Intl.NumberFormat('pt-BR').format(Number(value));
    }
    
    return String(value);
  };

  const getColumnTypeBadge = (type: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      text: { label: 'Texto', className: 'bg-muted text-muted-foreground' },
      number: { label: 'Número', className: 'bg-blue-500/10 text-blue-600' },
      currency: { label: 'Moeda', className: 'bg-status-success/10 text-status-success' },
      date: { label: 'Data', className: 'bg-purple-500/10 text-purple-600' },
    };
    const v = variants[type] || variants.text;
    return <Badge className={v.className}>{v.label}</Badge>;
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Pré-visualização dos Dados</CardTitle>
              <CardDescription>{fileName} • {data.length} registros • {columns.length} colunas</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-status-success border-status-success/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Arquivo válido
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Column Types Summary */}
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
          <span className="text-sm font-medium text-muted-foreground">Colunas detectadas:</span>
          {columns.slice(0, 6).map((col) => (
            <div key={col} className="flex items-center gap-1">
              <span className="text-sm">{col}</span>
              {getColumnTypeBadge(detectColumnType(col))}
            </div>
          ))}
          {columns.length > 6 && (
            <span className="text-sm text-muted-foreground">+{columns.length - 6} mais</span>
          )}
        </div>

        {/* Table Preview */}
        <ScrollArea className="w-full whitespace-nowrap rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 text-center">#</TableHead>
                {columns.map((col) => (
                  <TableHead key={col} className="min-w-[120px]">
                    <div className="space-y-1">
                      <span className="font-semibold">{col}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="text-center text-muted-foreground text-sm">
                    {startIndex + rowIndex + 1}
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col} className="max-w-[200px] truncate">
                      {formatValue(row[col], detectColumnType(col))}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(startIndex + rowsPerPage, data.length)} de {data.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Página {currentPage + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Target Table Selection */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-status-warning" />
            <span className="text-sm font-medium">Configurar importação</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Tabela de destino</label>
              <Select value={targetTable} onValueChange={setTargetTable}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione a tabela..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="faturamento">Faturamento Mensal</SelectItem>
                  <SelectItem value="custos">Custos Operacionais</SelectItem>
                  <SelectItem value="metas">Metas por Setor</SelectItem>
                  <SelectItem value="estoque">Giro de Estoque</SelectItem>
                  <SelectItem value="leads">Leads Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Período de referência</label>
              <Select defaultValue="jan-2026">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jan-2026">Janeiro 2026</SelectItem>
                  <SelectItem value="fev-2026">Fevereiro 2026</SelectItem>
                  <SelectItem value="mar-2026">Março 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={!targetTable || isLoading}
            className="gradient-accent"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Confirmar Importação ({data.length} registros)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
