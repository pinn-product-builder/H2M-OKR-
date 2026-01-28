import { useState, useCallback } from 'react';
import { DataRow } from '@/components/data/DataPreviewTable';

interface ParseResult {
  data: DataRow[];
  columns: string[];
  error: string | null;
}

// Simple CSV parser
function parseCSV(content: string): { data: DataRow[]; columns: string[] } {
  const lines = content.trim().split('\n');
  if (lines.length === 0) return { data: [], columns: [] };
  
  // Detect separator (comma, semicolon, or tab)
  const firstLine = lines[0];
  let separator = ',';
  if (firstLine.includes(';') && !firstLine.includes(',')) separator = ';';
  else if (firstLine.includes('\t') && !firstLine.includes(',')) separator = '\t';
  
  const columns = lines[0].split(separator).map(col => col.trim().replace(/^"|"$/g, ''));
  
  const data: DataRow[] = lines.slice(1).map(line => {
    const values = line.split(separator).map(val => val.trim().replace(/^"|"$/g, ''));
    const row: DataRow = {};
    columns.forEach((col, index) => {
      const value = values[index] || '';
      // Try to parse as number
      const num = parseFloat(value.replace(',', '.').replace(/[^\d.-]/g, ''));
      row[col] = !isNaN(num) && value.match(/^[\d.,\-\s]+$/) ? num : value;
    });
    return row;
  }).filter(row => Object.values(row).some(v => v !== '' && v !== null));
  
  return { data, columns };
}

// Generate mock data for Excel files (since we can't actually parse XLSX in browser without a library)
function generateMockExcelData(fileName: string): { data: DataRow[]; columns: string[] } {
  // Different mock data based on file name patterns
  if (fileName.toLowerCase().includes('faturamento') || fileName.toLowerCase().includes('vendas')) {
    const columns = ['Mês', 'Região', 'Vendedor', 'Valor', 'Meta', 'Atingimento'];
    const data: DataRow[] = [
      { Mês: 'Jan/2026', Região: 'Sul', Vendedor: 'Carlos Silva', Valor: 245000, Meta: 250000, Atingimento: 98 },
      { Mês: 'Jan/2026', Região: 'Sudeste', Vendedor: 'Ana Costa', Valor: 380000, Meta: 350000, Atingimento: 108.5 },
      { Mês: 'Jan/2026', Região: 'Norte', Vendedor: 'Pedro Santos', Valor: 125000, Meta: 150000, Atingimento: 83.3 },
      { Mês: 'Jan/2026', Região: 'Nordeste', Vendedor: 'Maria Lima', Valor: 189000, Meta: 200000, Atingimento: 94.5 },
      { Mês: 'Jan/2026', Região: 'Centro-Oeste', Vendedor: 'Bruno Martins', Valor: 156000, Meta: 160000, Atingimento: 97.5 },
      { Mês: 'Fev/2026', Região: 'Sul', Vendedor: 'Carlos Silva', Valor: 268000, Meta: 260000, Atingimento: 103 },
      { Mês: 'Fev/2026', Região: 'Sudeste', Vendedor: 'Ana Costa', Valor: 412000, Meta: 380000, Atingimento: 108.4 },
      { Mês: 'Fev/2026', Região: 'Norte', Vendedor: 'Pedro Santos', Valor: 142000, Meta: 155000, Atingimento: 91.6 },
    ];
    return { data, columns };
  }
  
  if (fileName.toLowerCase().includes('custo')) {
    const columns = ['Centro de Custo', 'Categoria', 'Descrição', 'Valor', 'Data', 'Status'];
    const data: DataRow[] = [
      { 'Centro de Custo': 'Operações', Categoria: 'Logística', Descrição: 'Frete Nacional', Valor: 45000, Data: '2026-01-15', Status: 'Pago' },
      { 'Centro de Custo': 'TI', Categoria: 'Software', Descrição: 'Licenças SaaS', Valor: 12500, Data: '2026-01-10', Status: 'Pago' },
      { 'Centro de Custo': 'Marketing', Categoria: 'Mídia', Descrição: 'Google Ads', Valor: 28000, Data: '2026-01-20', Status: 'Pendente' },
      { 'Centro de Custo': 'RH', Categoria: 'Benefícios', Descrição: 'Plano de Saúde', Valor: 85000, Data: '2026-01-05', Status: 'Pago' },
      { 'Centro de Custo': 'Financeiro', Categoria: 'Taxas', Descrição: 'Tarifas Bancárias', Valor: 3200, Data: '2026-01-28', Status: 'Pago' },
    ];
    return { data, columns };
  }
  
  if (fileName.toLowerCase().includes('estoque')) {
    const columns = ['SKU', 'Produto', 'Categoria', 'Quantidade', 'Custo Unitário', 'Valor Total', 'Giro'];
    const data: DataRow[] = [
      { SKU: 'PRD001', Produto: 'Widget A', Categoria: 'Eletrônicos', Quantidade: 450, 'Custo Unitário': 45.90, 'Valor Total': 20655, Giro: 8.2 },
      { SKU: 'PRD002', Produto: 'Widget B', Categoria: 'Eletrônicos', Quantidade: 320, 'Custo Unitário': 89.00, 'Valor Total': 28480, Giro: 6.5 },
      { SKU: 'PRD003', Produto: 'Componente X', Categoria: 'Peças', Quantidade: 1200, 'Custo Unitário': 12.50, 'Valor Total': 15000, Giro: 12.1 },
      { SKU: 'PRD004', Produto: 'Acessório Z', Categoria: 'Acessórios', Quantidade: 89, 'Custo Unitário': 230.00, 'Valor Total': 20470, Giro: 3.2 },
    ];
    return { data, columns };
  }
  
  // Default mock data
  const columns = ['ID', 'Nome', 'Categoria', 'Valor', 'Data', 'Status'];
  const data: DataRow[] = [
    { ID: 1, Nome: 'Item 1', Categoria: 'Categoria A', Valor: 1500, Data: '2026-01-15', Status: 'Ativo' },
    { ID: 2, Nome: 'Item 2', Categoria: 'Categoria B', Valor: 2800, Data: '2026-01-18', Status: 'Ativo' },
    { ID: 3, Nome: 'Item 3', Categoria: 'Categoria A', Valor: 950, Data: '2026-01-20', Status: 'Inativo' },
    { ID: 4, Nome: 'Item 4', Categoria: 'Categoria C', Valor: 4200, Data: '2026-01-22', Status: 'Ativo' },
    { ID: 5, Nome: 'Item 5', Categoria: 'Categoria B', Valor: 1850, Data: '2026-01-25', Status: 'Ativo' },
  ];
  
  return { data, columns };
}

export function useFileParser() {
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  const parseFile = useCallback(async (file: File): Promise<ParseResult> => {
    setIsLoading(true);
    
    return new Promise((resolve) => {
      // Simulate processing delay
      setTimeout(async () => {
        try {
          const extension = file.name.split('.').pop()?.toLowerCase();
          
          if (extension === 'csv') {
            const content = await file.text();
            const { data, columns } = parseCSV(content);
            const result = { data, columns, error: null };
            setParseResult(result);
            setIsLoading(false);
            resolve(result);
          } else if (extension === 'xlsx' || extension === 'xls') {
            // For Excel files, generate mock data based on file name
            const { data, columns } = generateMockExcelData(file.name);
            const result = { data, columns, error: null };
            setParseResult(result);
            setIsLoading(false);
            resolve(result);
          } else {
            const result = { data: [], columns: [], error: 'Formato não suportado' };
            setParseResult(result);
            setIsLoading(false);
            resolve(result);
          }
        } catch (err) {
          const result = { data: [], columns: [], error: 'Erro ao processar arquivo' };
          setParseResult(result);
          setIsLoading(false);
          resolve(result);
        }
      }, 800); // Simulate processing time
    });
  }, []);

  const clearResult = useCallback(() => {
    setParseResult(null);
  }, []);

  return {
    parseFile,
    clearResult,
    parseResult,
    isLoading
  };
}
