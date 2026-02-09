# Documentação técnica — Modelo de dados OKR (Supabase)

**Projeto:** H2M Intelligence  
**Versão:** 1.0  
**Última migration:** `20260209120000_okr_model_departments_cycles_objectives_krs.sql`

---

## 1. Visão geral

O modelo OKR no Supabase é composto por cinco tabelas principais, com integridade referencial e RLS (Row Level Security) por perfil (admin, gestor, analista, visualizador).

```
sectors (departments/áreas)
    ↑
okr_cycles (ciclos)
    ↑
objectives (OKRs) ──→ key_results (KRs) ──→ tasks (tarefas)
```

---

## 2. Tabelas e relações

### 2.1 `sectors` (Departments / Setores)

| Coluna       | Tipo      | Nullable | Default | Descrição                    |
|-------------|-----------|----------|---------|------------------------------|
| id          | uuid      | NOT NULL | gen_random_uuid() | PK. |
| name        | text      | NOT NULL | -       | Nome do setor.               |
| description | text      | YES      | -       | Descrição opcional.          |
| color       | text      | YES      | '#6366f1' | Cor (ex.: UI).            |
| is_active   | boolean   | YES      | true    | Setor ativo.                 |
| slug        | text      | YES      | -       | **Novo.** Identificador único (URLs). Índice UNIQUE WHERE slug IS NOT NULL. |
| created_at  | timestamptz | YES    | now()   |                              |
| updated_at  | timestamptz | YES    | now()   |                              |

**Constraints:** nenhuma FK de entrada.  
**RLS:** SELECT para autenticados; INSERT/UPDATE/DELETE apenas para `admin`.

---

### 2.2 `okr_cycles` (Ciclos)

| Coluna       | Tipo      | Nullable | Default | Descrição        |
|-------------|-----------|----------|---------|------------------|
| id          | uuid      | NOT NULL | gen_random_uuid() | PK. |
| name        | text      | NOT NULL | -       | Nome/label do ciclo. |
| start_date  | date      | NOT NULL | -       | Data início.     |
| end_date    | date      | NOT NULL | -       | Data fim.        |
| is_active   | boolean   | YES      | true    | Ciclo ativo.     |
| is_archived | boolean   | YES      | false   | Ciclo arquivado. |
| created_at  | timestamptz | YES    | now()   |                  |
| updated_at  | timestamptz | YES    | now()   |                  |

**Constraints:** nenhuma FK de entrada.  
**RLS:** SELECT para autenticados; INSERT/UPDATE/DELETE para `admin` e `gestor`.

---

### 2.3 `objectives` (Objetivos / OKRs)

| Coluna       | Tipo      | Nullable | Default | Descrição        |
|-------------|-----------|----------|---------|------------------|
| id          | uuid      | NOT NULL | gen_random_uuid() | PK. |
| title       | text      | NOT NULL | -       | Título.          |
| description | text      | YES      | -       | Descrição.       |
| cycle_id    | uuid      | NOT NULL | -       | FK → okr_cycles(id) ON DELETE CASCADE. |
| sector_id   | uuid      | YES      | -       | FK → sectors(id) ON DELETE SET NULL. |
| owner_id    | uuid      | YES      | -       | FK → auth.users(id) ON DELETE SET NULL. |
| parent_id   | uuid      | YES      | -       | FK → objectives(id) ON DELETE SET NULL. |
| status      | text      | YES      | 'on-track' | CHECK (on-track, attention, critical, completed). |
| progress    | numeric   | YES      | 0       | CHECK (0–100).   |
| priority    | text      | YES      | 'medium' | **Novo.** CHECK (high, medium, low). |
| start_date  | date      | YES      | -       |                  |
| due_date    | date      | YES      | -       |                  |
| is_archived | boolean   | YES      | false   |                  |
| created_at  | timestamptz | YES    | now()   |                  |
| updated_at  | timestamptz | YES    | now()   |                  |

**Relações:**
- `cycle_id` → `okr_cycles(id)` CASCADE
- `sector_id` → `sectors(id)` SET NULL
- `owner_id` → `auth.users(id)` SET NULL
- `parent_id` → `objectives(id)` SET NULL

**RLS:** SELECT para autenticados; INSERT para admin/gestor; UPDATE para admin/gestor/analista; DELETE apenas admin.

---

### 2.4 `key_results` (Key Results / KRs)

| Coluna        | Tipo      | Nullable | Default | Descrição        |
|--------------|-----------|----------|---------|------------------|
| id           | uuid      | NOT NULL | gen_random_uuid() | PK. |
| objective_id | uuid      | NOT NULL | -       | FK → objectives(id) ON DELETE CASCADE. |
| title        | text      | NOT NULL | -       | Título.          |
| description  | text      | YES      | -       |                  |
| type         | text      | YES      | 'percentage' | CHECK (numeric, percentage, boolean). |
| current_value| numeric   | YES      | 0       | Valor atual.     |
| target_value | numeric   | YES      | 100     | Meta.            |
| baseline_value | numeric | NOT NULL | 0       | **Novo.** Valor inicial de referência. |
| unit         | text      | YES      | -       | Unidade (%, R$, etc.). |
| weight       | numeric   | YES      | 1       | Peso.            |
| owner_id     | uuid      | YES      | -       | FK → auth.users(id) ON DELETE SET NULL. |
| status       | text      | YES      | 'on-track' | CHECK (on-track, attention, critical, completed). |
| due_date     | date      | YES      | -       |                  |
| created_at   | timestamptz | YES    | now()   |                  |
| updated_at   | timestamptz | YES    | now()   |                  |

**Relações:**
- `objective_id` → `objectives(id)` CASCADE

**RLS:** SELECT para autenticados; INSERT para admin/gestor; UPDATE para admin/gestor/analista; DELETE apenas admin.

---

### 2.5 `tasks` (Tarefas)

| Coluna         | Tipo      | Nullable | Default | Descrição        |
|----------------|-----------|----------|---------|------------------|
| id             | uuid      | NOT NULL | gen_random_uuid() | PK. |
| key_result_id  | uuid      | NOT NULL | -       | FK → key_results(id) ON DELETE CASCADE. |
| title          | text      | NOT NULL | -       |                  |
| description    | text      | YES      | -       |                  |
| assignee_id    | uuid      | YES      | -       | FK → auth.users(id) ON DELETE SET NULL. |
| status         | text      | YES      | 'pending' | CHECK (pending, in-progress, completed, blocked). |
| priority       | text      | YES      | 'medium' | CHECK (low, medium, high). |
| due_date       | date      | YES      | -       |                  |
| completed_at   | timestamptz | YES    | -       |                  |
| created_at     | timestamptz | YES    | now()   |                  |
| updated_at     | timestamptz | YES    | now()   |                  |

**Relações:**
- `key_result_id` → `key_results(id)` CASCADE
- `assignee_id` → `auth.users(id)` SET NULL

**RLS:** SELECT para autenticados; INSERT/UPDATE/DELETE para admin/gestor/analista.

---

## 3. Diagrama de integridade referencial

```
auth.users
    ├── objectives.owner_id (SET NULL)
    ├── key_results.owner_id (SET NULL)
    └── tasks.assignee_id (SET NULL)

sectors
    └── objectives.sector_id (SET NULL)

okr_cycles
    └── objectives.cycle_id (CASCADE)

objectives
    ├── objectives.parent_id (SET NULL)
    └── key_results.objective_id (CASCADE)

key_results
    └── tasks.key_result_id (CASCADE)
```

---

## 4. Alterações desta rodada (migration 20260209120000)

| Tabela        | Alteração        | Motivo                          |
|---------------|-------------------|----------------------------------|
| sectors       | Coluna `slug`     | Identificação única por área     |
| objectives    | Coluna `priority` | Prioridade do objetivo (high/medium/low) |
| key_results   | Coluna `baseline_value` NOT NULL DEFAULT 0 | Baseline para progresso e análise |

---

## 5. Testes de inserção e consulta

Ver script: `docs/sql/test-okr-entities.sql` (ou `supabase/seed-test-okr.sql`).  
Inclui: inserção em sectors, okr_cycles, objectives, key_results, tasks e consultas de validação (joins, contagens).

---

## 6. Sincronização com tipos TypeScript

Após aplicar a migration, regenerar tipos Supabase quando possível:

```bash
npx supabase gen types typescript --project-id <PROJECT_ID> > src/integrations/supabase/types.ts
```

Os tipos locais em `src/hooks/useSupabaseData.ts` e `src/integrations/supabase/types.ts` foram ajustados para incluir `baseline_value`, `priority` e `slug` até que a geração automática seja executada.

---

## 7. Validação final e sincronização com stakeholders

- **Aplicar migration:** no projeto Supabase, executar as migrations (ex.: `supabase db push` ou aplicar `20260209120000_okr_model_departments_cycles_objectives_krs.sql` no SQL Editor).
- **Testes:** executar `docs/sql/test-okr-entities.sql` em ambiente de desenvolvimento/homologação e validar que não há erros de constraint e que as consultas retornam dados esperados.
- **Frontend:** o app já utiliza `baseline_value` (KRs), `priority` (objetivos) e está preparado para `slug` (setores). Novos OKRs passam a persistir prioridade e baseline.
- **Comunicação:** compartilhar com PO/Cliente e QA: (1) raio-x em `docs/RAIO-X-MODELO-OKR.md`, (2) documentação técnica em `docs/MODELO-OKR-DOCUMENTACAO-TECNICA.md`, (3) confirmação de que a estrutura atende a registro, acompanhamento e análise por área e ciclo.
