# Documentação H2M Intelligence

## Índice

- **[UAT-ROTEIRO-H2M.md](./UAT-ROTEIRO-H2M.md)** – Roteiro completo de User Acceptance Test (UAT)
  - Fluxos e casos de teste por funcionalidade (Auth, Dashboard, OKRs, Data Source, Usuários, Configurações)
  - Checklist de permissões (admin, gestor, analista, visualizador)
  - Testes de performance, dados vazios, mensagens de erro e modelo de relatório de aprovação

- **[RAIO-X-MODELO-OKR.md](./RAIO-X-MODELO-OKR.md)** – Raio-x aprovado do modelo de dados OKR
  - Requisitos por entidade: departments (sectors), cycles, objectives, key results, tasks
  - Integridade referencial e ajustes implementados

- **[MODELO-OKR-DOCUMENTACAO-TECNICA.md](./MODELO-OKR-DOCUMENTACAO-TECNICA.md)** – Documentação técnica do schema Supabase
  - Tabelas, colunas, constraints, FKs e RLS
  - Alterações da migration `20260209120000` (slug, priority, baseline_value)

- **[sql/test-okr-entities.sql](./sql/test-okr-entities.sql)** – Script SQL para testes de inserção e consulta nas entidades OKR (validação pós-migration).

Use o roteiro UAT para validação final do sistema antes do go-live. Recomenda-se validar os pontos críticos com a equipe de QA antes de iniciar o UAT (Seção 2 do roteiro).
