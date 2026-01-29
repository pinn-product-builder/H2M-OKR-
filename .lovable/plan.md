
# Plano: Sistema de Permissoes com Grupos, Melhorias Data Hub, UI do Tema e Cards Dashboard

## Resumo

Implementar sistema de gestao de usuarios com grupos e permissoes RLS para Supabase, restringir Data Source apenas para admin/usuarios com permissao, melhorar tela de Data Source com mapeamento via tabela na criacao, mover seletor de tema para o Header (ao lado do usuario), remover aba Aparencia de Configuracoes, e atualizar os cards do Dashboard para exibir metricas de OKRs e Atividades.

---

## O que sera implementado

### 1. Sistema de Gestao de Usuarios com Grupos e Permissoes

**Estrutura no Supabase (RLS):**
- Criar enum `app_role` com valores: admin, gestor, analista, visualizador
- Criar tabela `user_roles` vinculada a auth.users
- Criar funcao security definer `has_role` para verificar roles sem recursao
- Implementar RLS policies baseadas em roles

**Interface de Gestao (UsuariosSection):**
- Quadro visual de grupos de permissoes
- Atribuicao de usuarios a grupos
- Visualizacao de permissoes por grupo
- CRUD de usuarios com selecao de role

### 2. Restricao de Acesso ao Data Source

- Modificar `checkDataHubAccess` para negar acesso a usuarios sem role adequada
- Apenas `admin` e usuarios com permissao `canView` podem acessar
- Visualizador nao pode importar nem gerenciar mapeamentos
- Tela de acesso negado para usuarios sem permissao

### 3. Melhorias no Data Hub - Mapeamento via Tabela

**Na tela de Nova Planilha:**
- Adicionar interface de mapeamento ja na criacao
- Tabela para definir colunas de origem e campos de destino
- Pre-configurar transformacoes (SUM, AVG, COUNT, etc.)
- Validacao de campos obrigatorios

### 4. Seletor de Tema no Header

**Mover tema para Header:**
- Adicionar Select/Toggle de tema ao lado do usuario logado
- Opcoes: Claro e Escuro (remover Sistema por simplicidade)
- Criar contexto de tema para persistir preferencia

**Remover de Configuracoes:**
- Eliminar aba "Aparencia" do ConfiguracoesSection
- Remover opcoes de cor de destaque, animacoes e modo compacto

### 5. Atualizar Cards do Dashboard

**Novos cards:**
1. **OKRs no Prazo** - Quantidade de OKRs com status 'on-track'
2. **OKRs em Atraso** - Quantidade de OKRs com status 'attention' ou 'critical'
3. **Atividades no Prazo** - Tarefas completas ou em andamento dentro do prazo
4. **Atividades em Atraso** - Tarefas pendentes com prazo expirado

---

## Arquivos a serem modificados/criados

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/types/user.ts` | Criar | Tipos para roles, grupos e permissoes |
| `src/contexts/ThemeContext.tsx` | Criar | Contexto de tema com persistencia |
| `src/components/layout/Header.tsx` | Modificar | Adicionar seletor de tema |
| `src/components/sections/UsuariosSection.tsx` | Modificar | Quadro de grupos e gestao de permissoes |
| `src/components/sections/ConfiguracoesSection.tsx` | Modificar | Remover aba Aparencia |
| `src/components/sections/DataSourceSection.tsx` | Modificar | Mapeamento na criacao |
| `src/components/data/NewSourceWithMapping.tsx` | Criar | Dialog de nova fonte com mapeamento |
| `src/lib/dataHubPermissions.ts` | Modificar | Refinar permissoes |
| `src/data/mockData.ts` | Modificar | Novos cards de metricas |
| `src/components/dashboard/Dashboard.tsx` | Modificar | Usar metricas dinamicas |
| `src/App.tsx` | Modificar | Adicionar ThemeProvider |
| `.lovable/supabase_migrations/` | Criar | Migrations para user_roles e RLS |

---

## Detalhes Tecnicos

### Novos Tipos (user.ts)
```text
AppRole = 'admin' | 'gestor' | 'analista' | 'visualizador'

UserRole {
  id: string
  userId: string
  role: AppRole
}

RolePermissions {
  role: AppRole
  label: string
  description: string
  permissions: {
    canManageUsers: boolean
    canAccessDataHub: boolean
    canImportData: boolean
    canManageOKRs: boolean
    canEditOKRs: boolean
    canViewDashboard: boolean
    canManageSettings: boolean
  }
}
```

### ThemeContext
```text
ThemeContext {
  theme: 'light' | 'dark'
  setTheme: (theme) => void
}

// Persistir em localStorage
// Aplicar classe no document.documentElement
```

### Migracao Supabase - user_roles
```sql
-- Criar enum para roles
create type public.app_role as enum ('admin', 'gestor', 'analista', 'visualizador');

-- Criar tabela user_roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);

-- Habilitar RLS
alter table public.user_roles enable row level security;

-- Funcao security definer para verificar role
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Policy: Admins podem ver todos os roles
create policy "Admins can view all roles"
on public.user_roles
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Policy: Usuarios podem ver seu proprio role
create policy "Users can view own role"
on public.user_roles
for select
to authenticated
using (user_id = auth.uid());
```

### Quadro de Gestao de Grupos (UsuariosSection)
```text
┌────────────────────────────────────────────────────────┐
│ Gestao de Usuarios e Grupos                            │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────┐│
│ │ ADMIN       │ │ GESTOR      │ │ ANALISTA    │ │ VIS ││
│ │             │ │             │ │             │ │     ││
│ │ ● Carlos    │ │ ● Roberto   │ │ ● Ana       │ │ ● M ││
│ │             │ │ ● Fernanda  │ │ ● Pedro     │ │     ││
│ │             │ │ ● Bruno     │ │ ● Maria     │ │     ││
│ │             │ │ ● Andre     │ │             │ │     ││
│ │             │ │             │ │             │ │     ││
│ │ [1 usuario] │ │ [4 usuarios]│ │ [3 usuarios]│ │ [1] ││
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────┘│
│                                                        │
│ Arrastar usuarios entre grupos para alterar role       │
└────────────────────────────────────────────────────────┘
```

### Cards do Dashboard - Novas Metricas
```text
Card 1: OKRs no Prazo
  - Contagem de objectives com status === 'on-track'
  - Icone: Target (verde)
  - Variante: success

Card 2: OKRs em Atraso
  - Contagem de objectives com status === 'attention' ou 'critical'
  - Icone: AlertTriangle (vermelho)
  - Variante: warning/critical

Card 3: Atividades no Prazo
  - Tarefas com status !== 'completed' E sem dueDate expirado
  - Icone: CheckCircle
  - Variante: success

Card 4: Atividades em Atraso
  - Tarefas pendentes com dueDate < hoje
  - Icone: Clock (vermelho)
  - Variante: critical
```

### Seletor de Tema no Header
```text
Antes do avatar do usuario:

┌────────────────────────────────────┐
│ [🔔] [☀️/🌙 ▼] [👤 Carlos ▼]     │
└────────────────────────────────────┘

Select simples:
  - ☀️ Claro
  - 🌙 Escuro
```

### Nova Fonte com Mapeamento (NewSourceWithMapping)
```text
┌────────────────────────────────────────────────────────┐
│ Nova Fonte de Dados                                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Nome da Fonte: [________________]                      │
│ Tabela Destino: [Faturamento Mensal ▼]                │
│                                                        │
│ ─────────────────────────────────────                  │
│ Mapeamento de Colunas (opcional)                       │
│ ─────────────────────────────────────                  │
│                                                        │
│ │ Coluna Arquivo  │ Campo Sistema │ Transformacao │   │
│ │─────────────────│───────────────│───────────────│   │
│ │ [valor_total   ]│ [Valor      ▼]│ [SUM        ▼]│   │
│ │ [data_venda    ]│ [Data       ▼]│ [NONE       ▼]│   │
│ │ [setor         ]│ [Setor      ▼]│ [NONE       ▼]│   │
│ │                 │ [+ Adicionar ]│               │   │
│                                                        │
│ [Cancelar]                    [Criar Fonte]           │
└────────────────────────────────────────────────────────┘
```

### ConfiguracoesSection Atualizado
```text
Tabs atualizadas (removendo Aparencia):

Admin:    [Geral] [Integracao] [Notificacoes] [Seguranca] [Setores]
Non-Admin: [Geral] [Integracao] [Notificacoes] [Seguranca]
```

---

## Fluxo de Implementacao

1. **Criar tipos** (user.ts): Roles, permissoes e grupos
2. **Criar ThemeContext**: Contexto de tema com persistencia
3. **Atualizar App.tsx**: Adicionar ThemeProvider
4. **Modificar Header**: Adicionar seletor de tema
5. **Atualizar ConfiguracoesSection**: Remover aba Aparencia
6. **Atualizar UsuariosSection**: Quadro de gestao de grupos
7. **Modificar mockData**: Novos cards de metricas
8. **Atualizar Dashboard**: Usar metricas dinamicas de OKRs/Tarefas
9. **Criar NewSourceWithMapping**: Dialog com mapeamento integrado
10. **Atualizar DataSourceSection**: Integrar novo dialog
11. **Refinar dataHubPermissions**: Restricoes de acesso
12. **Criar migration SQL**: Estrutura para Supabase (user_roles)

---

## Resultado Esperado

- Sistema de grupos de usuarios com visualizacao clara de permissoes
- Data Source acessivel apenas para admin e usuarios autorizados
- Mapeamento de campos disponivel ja na criacao de fontes
- Tema claro/escuro selecionavel no Header (simples e acessivel)
- Aba Aparencia removida de Configuracoes
- Dashboard mostrando metricas de OKRs no Prazo, em Atraso, Atividades no Prazo e em Atraso
- Estrutura preparada para integracao com Supabase RLS
