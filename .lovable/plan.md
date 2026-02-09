
# Implementacao do Mapa de KR para Criacao de Tarefas

## Visao Geral

Atualmente, o `TaskForm` recebe `krId` e `okrId` como props obrigatorias, funcionando apenas dentro do contexto de um KR especifico (no `OKRDetailModal`). Esta implementacao adicionara um **seletor visual hierarquico** (Mapa de KR) que permite criar tarefas a partir de qualquer contexto, visualizando a estrutura:

```text
Objetivo (OKR)
 └── Key Result 1  ← selecionar
 └── Key Result 2  ← selecionar
```

---

## Funcionalidades

1. **KRMap Component**: Componente visual que exibe a hierarquia OKR/KR em formato arvore expansivel
2. **TaskFormWithKRMap**: Nova versao do TaskForm que inclui o seletor de KR quando `krId` nao for fornecido
3. **Filtros de contexto**: Opcao de filtrar por ciclo ativo e setor
4. **Preview do KR selecionado**: Exibe informacoes do KR escolhido (progresso, responsavel, etc.)

---

## Arquitetura

```text
TaskFormWithKRMap
├── Se krId fornecido → comportamento atual (sem mapa)
└── Se krId NAO fornecido:
    ├── KRMap (seletor hierarquico)
    │   ├── Filtro por Ciclo
    │   ├── Lista de OKRs expansiveis
    │   │   └── Key Results clicaveis
    │   └── Preview do KR selecionado
    └── Formulario de Tarefa (campos existentes)
```

---

## Fluxo de Usuario

1. Usuario abre o formulario de "Nova Tarefa" (de qualquer lugar)
2. Se nao houver KR pre-selecionado, exibe o Mapa de KR
3. Usuario expande um OKR para ver seus KRs
4. Usuario clica em um KR para seleciona-lo
5. Card de preview mostra detalhes do KR
6. Usuario preenche os campos da tarefa (titulo, responsavel, prazo, prioridade)
7. Ao salvar, tarefa eh vinculada ao KR selecionado

---

## Componentes a Criar

### 1. `src/components/okr/KRMap.tsx`
Componente visual para navegacao hierarquica:

```typescript
interface KRMapProps {
  selectedKRId?: string;
  onSelectKR: (krId: string, okrId: string, krTitle: string, okrTitle: string) => void;
  cycleFilter?: string;
}
```

**Caracteristicas:**
- Accordion com OKRs agrupados por setor
- Cada OKR eh expansivel para mostrar seus KRs
- KRs mostram: titulo, progresso, status (badge colorido)
- Item selecionado tem destaque visual
- Suporte a busca por texto

### 2. `src/components/okr/KRPreview.tsx`
Card de preview do KR selecionado:

```typescript
interface KRPreviewProps {
  krId: string;
  okrId: string;
  krTitle: string;
  okrTitle: string;
  onClear: () => void;
}
```

**Mostra:**
- Titulo do OKR pai
- Titulo do KR
- Progresso atual (barra)
- Responsavel
- Botao para limpar selecao

### 3. Atualizacao do `TaskForm.tsx`
Tornar `krId` e `okrId` opcionais e integrar o mapa:

```typescript
interface TaskFormProps {
  krId?: string;        // Opcional agora
  okrId?: string;       // Opcional agora
  onTaskCreated?: (task: Task) => void;
  trigger?: React.ReactNode;
}
```

**Logica:**
- Se `krId` fornecido → usa direto (comportamento atual)
- Se `krId` nao fornecido → exibe KRMap como primeiro passo
- Formulario so habilita apos selecao de KR

---

## Design Visual

### KRMap Layout:
```text
┌────────────────────────────────────────┐
│ 🔍 Buscar OKR ou KR...                │
├────────────────────────────────────────┤
│ ▼ Comercial                           │
│   ├─ ▼ Aumentar faturamento Q1        │
│   │    ├─ ○ KR1: Novos clientes (45%) │
│   │    └─ ● KR2: Ticket médio (72%) ← │
│   └─ ▶ Melhorar conversão...          │
│                                        │
│ ▶ Marketing                           │
│ ▶ Produção                            │
└────────────────────────────────────────┘
```

### Estados visuais:
- **Normal**: fundo neutro, texto padrao
- **Hover**: fundo muted, cursor pointer
- **Selecionado**: borda accent, fundo accent/10, icone preenchido
- **Progresso**: badges coloridos (success/warning/critical)

---

## Arquivos a Criar/Modificar

### Novos Arquivos:
| Arquivo | Descricao |
|---------|-----------|
| `src/components/okr/KRMap.tsx` | Componente de mapa hierarquico |
| `src/components/okr/KRPreview.tsx` | Card de preview do KR selecionado |

### Arquivos a Modificar:
| Arquivo | Alteracao |
|---------|-----------|
| `src/components/okr/TaskForm.tsx` | Tornar krId/okrId opcionais, integrar KRMap |

---

## Implementacao Tecnica

### Hook de dados para KRMap
Reutiliza `useObjectives` ja existente que retorna:
```typescript
objectives: {
  id, title, sector, status, progress,
  key_results: [
    { id, title, status, current_value, target_value, owner }
  ]
}
```

### Schema de validacao atualizado
```typescript
const taskSchema = z.object({
  krId: z.string().min(1, 'Selecione um Key Result'),  // Novo campo
  okrId: z.string().min(1, 'OKR obrigatório'),         // Novo campo
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  assignedTo: z.string().min(1, 'Selecione um responsável'),
  dueDate: z.date().optional(),
  priority: z.enum(['high', 'medium', 'low']),
});
```

---

## Casos de Uso

| Local | Comportamento |
|-------|---------------|
| Dentro do OKRDetailModal (KR expandido) | krId passado como prop → sem mapa |
| Botao "Nova Tarefa" global | Sem krId → exibe mapa completo |
| Acao rapida de usuario | Sem krId → exibe mapa |

---

## Ordem de Execucao

1. Criar `KRPreview.tsx` - componente simples de preview
2. Criar `KRMap.tsx` - componente hierarquico com busca
3. Atualizar `TaskForm.tsx` - integrar mapa quando krId ausente
4. Testar fluxo completo de criacao de tarefas

---

## Consideracoes de UX

- Filtro por ciclo ativo por padrao
- Expansao automatica do primeiro OKR se houver poucos
- Animacao suave de expansao/colapso
- Feedback visual claro de item selecionado
- Validacao: nao permitir submit sem KR selecionado
