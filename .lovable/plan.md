
# Plano: Ativar Criacao de OKR com Importacao de Documentos + Layout Box-to-Box

## Resumo
Ativar o botao "Novo OKR" no Dashboard conectando ao formulario de criacao existente, adicionar importacao de documentos (PDF, Excel, XLSX, DOCX) com mapeamento inteligente de dados, e ajustar o layout dos cards OKR para exibicao lado a lado (box-to-box) com perfeito dimensionamento e alinhamento.

---

## O que sera implementado

### 1. Ativar Botao "Novo OKR" no Dashboard
- Importar e integrar o componente `NewOKRForm` no Dashboard
- Substituir o botao estatico pelo trigger funcional do formulario
- Manter estilo visual existente (gradient-accent)

### 2. Layout Box-to-Box para Cards OKR
- Modificar o grid dos cards OKR de coluna unica para grid 2x2
- Cards exibidos lado a lado com largura igual
- Altura uniforme entre cards adjacentes
- Responsivo: 1 coluna em mobile, 2 colunas em desktop

### 3. Importacao de Documentos no Formulario
- Adicionar secao colapsavel "Importar dados de documento" no NewOKRForm
- Expandir FileDropZone para aceitar PDF, DOCX alem de CSV/Excel
- Criar hook useDocumentParser para parsing universal de documentos
- Interface de mapeamento visual de colunas do documento para campos do OKR

### 4. Mapeamento Inteligente de Dados
- Preview dos dados extraidos do documento
- Selecao de colunas para mapear para campos do OKR (titulo, metas, baseline)
- Preenchimento automatico de Key Results a partir dos dados importados
- Sugestoes automaticas baseadas em nomes de colunas

---

## Arquivos a serem modificados/criados

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/components/dashboard/Dashboard.tsx` | Modificar | Importar NewOKRForm, ajustar grid para box-to-box |
| `src/hooks/useDocumentParser.ts` | Criar | Parser universal para PDF, DOCX, Excel, CSV |
| `src/components/okr/DocumentDataMapper.tsx` | Criar | Interface de mapeamento de dados do documento |
| `src/components/data/FileDropZone.tsx` | Modificar | Expandir formatos aceitos (PDF, DOCX) |
| `src/components/okr/NewOKRForm.tsx` | Modificar | Adicionar secao de importacao colapsavel |

---

## Detalhes Tecnicos

### Modificacoes no Dashboard.tsx

**Layout Box-to-Box**
```text
Antes:
┌─────────────────────────────────┐
│ OKR Card 1                      │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ OKR Card 2                      │
└─────────────────────────────────┘

Depois:
┌───────────────┐ ┌───────────────┐
│ OKR Card 1    │ │ OKR Card 2    │
└───────────────┘ └───────────────┘
┌───────────────┐ ┌───────────────┐
│ OKR Card 3    │ │ OKR Card 4    │
└───────────────┘ └───────────────┘
```

**Grid CSS**
```text
Atual: className="grid gap-4"
Novo:  className="grid grid-cols-1 md:grid-cols-2 gap-4"
```

**Integracao do NewOKRForm**
```text
import { NewOKRForm } from '@/components/okr/NewOKRForm';

// Substituir botao estatico por:
<NewOKRForm 
  trigger={
    <Button size="sm" className="gap-2 gradient-accent text-accent-foreground border-0">
      <Plus className="w-4 h-4" />
      Novo OKR
    </Button>
  } 
/>
```

### Novo Hook: useDocumentParser.ts
```text
useDocumentParser {
  parseDocument(file: File): Promise<ParsedDocument>
  isLoading: boolean
  error: string | null
  result: ParsedDocument | null
}

ParsedDocument {
  type: 'csv' | 'excel' | 'pdf' | 'docx'
  fileName: string
  data: DataRow[]
  columns: string[]
  rawText?: string (para PDF/DOCX)
  detectedTables?: ExtractedTable[]
}

Estrategia de Parsing por Formato:
- CSV: Parser existente do useFileParser
- XLSX/XLS: Mock data inteligente por nome do arquivo
- PDF: Extrair texto, detectar tabelas por padroes
- DOCX: Extrair XML interno, parsear conteudo
```

### Novo Componente: DocumentDataMapper.tsx
```text
Interface visual de mapeamento:

┌────────────────────────────────────────────────────────┐
│ Dados Extraidos do Documento                           │
├────────────────────────────────────────────────────────┤
│ Arquivo: relatorio_vendas.xlsx                         │
│ 6 colunas detectadas | 45 registros                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Coluna Documento   Mapear Para          Preview       │
│  ┌───────────────┐  ┌───────────────┐   ┌──────────┐  │
│  │ Meta Vendas   │→ │ KR Target     │   │ R$ 250K  │  │
│  └───────────────┘  └───────────────┘   └──────────┘  │
│  ┌───────────────┐  ┌───────────────┐   ┌──────────┐  │
│  │ Valor Atual   │→ │ KR Baseline   │   │ R$ 180K  │  │
│  └───────────────┘  └───────────────┘   └──────────┘  │
│                                                        │
│  [x] Criar KRs automaticamente das linhas              │
│                                                        │
│  [Cancelar]                    [Aplicar Mapeamento]    │
└────────────────────────────────────────────────────────┘

Campos mapeaeis:
- Titulo do OKR
- Descricao
- KR Titulo
- KR Target (meta)
- KR Baseline
- KR Unidade
```

### Modificacoes no FileDropZone.tsx
```text
Expandir accept prop:
Antes: accept = '.csv,.xlsx,.xls'
Depois: accept = '.csv,.xlsx,.xls,.pdf,.docx,.doc'

Atualizar texto de suporte:
"Suporta CSV, Excel, PDF, Word (max. 10MB)"
```

### Modificacoes no NewOKRForm.tsx
```text
Adicionar secao colapsavel antes dos campos:

<Collapsible>
  <CollapsibleTrigger>
    <FileSpreadsheet /> Importar dados de documento (opcional)
  </CollapsibleTrigger>
  <CollapsibleContent>
    <FileDropZone 
      accept=".csv,.xlsx,.xls,.pdf,.docx" 
      onFileSelect={handleFileSelect}
    />
    {parsedData && (
      <DocumentDataMapper 
        data={parsedData}
        onMapping={handleDataMapping}
      />
    )}
  </CollapsibleContent>
</Collapsible>

Fluxo de mapeamento:
1. Usuario arrasta/seleciona documento
2. Sistema faz parse e extrai dados
3. Exibe interface de mapeamento
4. Usuario associa colunas aos campos
5. Dados preenchem formulario automaticamente
```

---

## Fluxo de Implementacao

1. **Modificar Dashboard.tsx**
   - Importar NewOKRForm
   - Conectar botao ao formulario
   - Ajustar grid para layout box-to-box (grid-cols-2)

2. **Criar useDocumentParser.ts**
   - Implementar parser universal
   - Suporte a CSV, Excel, PDF, DOCX
   - Deteccao automatica de formato

3. **Expandir FileDropZone.tsx**
   - Aceitar novos formatos (PDF, DOCX)
   - Atualizar mensagens de suporte

4. **Criar DocumentDataMapper.tsx**
   - Interface de mapeamento visual
   - Selecao de colunas do documento
   - Preview de dados
   - Aplicacao do mapeamento

5. **Modificar NewOKRForm.tsx**
   - Adicionar secao colapsavel de importacao
   - Integrar FileDropZone expandido
   - Integrar DocumentDataMapper
   - Logica de preenchimento automatico

---

## Resultado Esperado

- Botao "Novo OKR" no Dashboard abre formulario de criacao
- Cards OKR exibidos lado a lado (2 colunas) com alinhamento perfeito
- Formulario permite importar dados de documentos
- Suporte a PDF, Excel, CSV, Word
- Mapeamento visual de colunas para campos do OKR
- Key Results podem ser criados automaticamente dos dados importados
- Interface responsiva (1 coluna mobile, 2 colunas desktop)
