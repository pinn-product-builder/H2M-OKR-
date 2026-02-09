# Raio-X do modelo de dados OKR — H2M Intelligence

**Versão:** 1.0  
**Status:** Aprovado para implementação  
**Objetivo:** Definir requisitos de modelagem para registro, acompanhamento e análise de OKRs por área (setor) e ciclo.

---

## 1. Glossário e equivalências

| Termo negócio / checklist | Entidade no sistema | Observação |
|---------------------------|---------------------|------------|
| **Departments** / Áreas / Setores | `sectors` | Tabela `sectors` no Supabase; um setor agrupa objetivos por área. |
| **Cycles** / Ciclos OKR | `okr_cycles` | Período (início/fim) com nome e flag ativo/arquivado. |
| **Objectives** / Objetivos / OKRs | `objectives` | Objetivo estratégico vinculado a um ciclo e opcionalmente a um setor. |
| **Key Results** / KRs / Resultados-chave | `key_results` | Resultado mensurável vinculado a um objetivo. |
| **Tasks** / Tarefas | `tasks` | Tarefa operacional vinculada a um Key Result. |

---

## 2. Requisitos por entidade

### 2.1 Departments → `sectors`

- **Registro:** nome, descrição (opcional), cor, ativo.
- **Identificação:** slug único para URLs/APIs (opcional; pode ser derivado do nome).
- **Uso:** agrupamento de objetivos por área; filtros no dashboard e relatórios.
- **Regras:** apenas administradores criam/editam/excluem; todos autenticados podem visualizar.

### 2.2 Cycles → `okr_cycles`

- **Registro:** nome (label), data início, data fim, ativo, arquivado.
- **Uso:** agrupar objetivos por período; um objetivo pertence a um único ciclo.
- **Regras:** apenas admin e gestor criam/editam; todos visualizam.

### 2.3 Objectives → `objectives`

- **Registro:** título, descrição (opcional), ciclo (obrigatório), setor (opcional), responsável (owner), status, progresso, datas início/fim (opcional), arquivado.
- **Requisito adicional:** **prioridade** (alta, média, baixa) para ordenação e filtros.
- **Relações:** pertence a um `okr_cycles`; opcionalmente a um `sectors`; pode ter `parent_id` (OKR pai); tem N `key_results`.
- **Regras:** admin/gestor inserem; admin/gestor/analista atualizam (ex.: progresso); apenas admin exclui.

### 2.4 Key Results → `key_results`

- **Registro:** título, tipo (numeric, percentage, boolean), valor atual, **valor alvo (target)**, **valor baseline**, unidade, peso, responsável, status, data limite (opcional).
- **Requisito adicional:** **baseline** obrigatório para cálculo de progresso e análises (valor inicial de referência).
- **Relações:** pertence a um `objectives`; tem N `tasks`.
- **Regras:** admin/gestor inserem; admin/gestor/analista atualizam; apenas admin exclui.

### 2.5 Tasks → `tasks`

- **Registro:** título, descrição, KR pai, responsável (assignee), status, prioridade, data limite, data conclusão.
- **Relações:** pertence a um `key_results`.
- **Regras:** admin/gestor/analista gerenciam (CRUD).

---

## 3. Integridade e consistência

- **Chaves estrangeiras:** todas as relações acima devem ser garantidas por FK no banco.
- **Exclusão em cascata:** ao excluir ciclo → excluir objetivos (e KRs e tarefas); ao excluir objetivo → excluir KRs e tarefas; ao excluir KR → excluir tarefas.
- **Setor:** ao excluir setor, objetivos com `sector_id` referenciado devem ter `sector_id` setado para `NULL` (ON DELETE SET NULL).
- **Constraints:** status e tipo em valores fixos (check ou enum); progresso entre 0 e 100; prioridade em (high, medium, low).

---

## 4. Ajustes identificados (backend Supabase)

| Entidade | Ajuste | Motivo |
|----------|--------|--------|
| `sectors` | Adicionar coluna `slug` (texto, único quando preenchido) | Alinhar com uso em frontend e APIs; permitir URLs por setor. |
| `objectives` | Adicionar coluna `priority` (texto: high, medium, low; default medium) | Requisito de prioridade para ordenação e filtros. |
| `key_results` | Adicionar coluna `baseline_value` (numérico; default 0) | Baseline necessário para cálculo de progresso e análises. |

---

## 5. Aprovação

| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| Product Owner / Cliente | | | |
| Tech Lead / Backend | | | |

---

*Documento de referência para a migration e a documentação técnica do modelo OKR (H2M Intelligence).*
