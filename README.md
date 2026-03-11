# H2M OKR

O **H2M OKR** é a plataforma de gestão de OKRs (Objectives and Key Results) da PINN, criada para definir objetivos, acompanhar key results, gerenciar ciclos e setores, e manter visibilidade do progresso em dashboards e relatórios.

Repositório: [pinn-product-builder/H2M-OKR-](https://github.com/pinn-product-builder/H2M-OKR-).

---

## Visão geral do produto

O H2M OKR atua como um **hub de planejamento e acompanhamento** baseado em OKRs, permitindo:

- Definição de **objetivos** e **key results** com metas numéricas e prazos.
- Organização por **ciclos** e **setores/departamentos**.
- **Tarefas** vinculadas a key results para execução no dia a dia.
- **Dashboard** com visão consolidada de progresso e indicadores.
- **Importação de dados** (planilhas, etc.) para popular ou sincronizar OKRs.
- **Gestão de usuários** e permissões integrada ao Supabase.

O objetivo da plataforma é oferecer uma **visão única e acionável** do que importa para o negócio, alinhando equipes em torno de objetivos mensuráveis e acompanhamento contínuo.

---

## Principais capacidades

- **Gestão de OKRs**: cadastro de objetivos, key results (numéricos ou percentuais), baseline, meta e responsáveis.
- **Ciclos e setores**: configuração de ciclos de planejamento e setores para organização hierárquica.
- **Tarefas**: criação de tarefas vinculadas a KRs, com prioridade, status e prazos.
- **Dashboard**: visão geral de progresso, status (on-track, attention, critical, completed) e indicadores.
- **Importação**: suporte a importação via planilhas (xlsx) e tratamento de dados normalizados.
- **Views salvas**: persistência de filtros e visualizações preferidas (quando aplicável).
- **Autenticação e roles**: login e controle de acesso via Supabase Auth e funções (ex.: update-user-role, register-user).

---

## Arquitetura em alto nível

- **Frontend**: aplicação React (Vite) com rotas protegidas (login vs. área autenticada), sidebar, dashboard e seções de OKRs, usuários e configurações.
- **Backend / dados**: Supabase (PostgreSQL, Auth, Edge Functions para registro e ingestão).
- **Estado**: React Query para dados remotos, contextos (App, Auth, Theme) para estado global e preferências.

Fluxo principal: usuário autentica → acessa Dashboard e Gestão de OKRs → cria/edita objetivos e key results → acompanha progresso e tarefas no dashboard e nas listagens.

---

## Tecnologias principais

Este repositório concentra o **frontend web** do H2M OKR, construído em TypeScript:

- **Linguagem**: TypeScript.
- **Framework de UI**: React 18.
- **Bundler / dev server**: Vite.
- **Design system e componentes**: Shadcn UI (Radix UI), Tailwind CSS, `lucide-react`.
- **Estado remoto e dados**: `@tanstack/react-query`, `@supabase/supabase-js`.
- **Formulários e validação**: `react-hook-form`, `zod`, `@hookform/resolvers`.
- **Gráficos e visualizações**: `recharts`.
- **Planilhas**: `xlsx` para importação/exportação.
- **Testes**: Vitest, Testing Library; E2E com Playwright (`e2e/`, `playwright.config.ts`).
- **Qualidade de código**: ESLint, TypeScript (`eslint.config.js`, `tsconfig.*`).
- **Deploy**: Docker (`Dockerfile`, `docker-compose.yml`) e suporte a publicação via Lovable.

---

## Estrutura do repositório

- `src/` – Código-fonte da aplicação React: páginas (Index, Login, NotFound), componentes (layout, dashboard, seções OKRs/usuários/configurações), contextos, hooks, lib (cálculos OKR, normalização de datas, permissões), integrações Supabase e tipos.
- `public/` – Assets estáticos.
- `supabase/` – Migrations (modelo OKR: sectors, cycles, objectives, key_results, tasks, usuários) e Edge Functions (create-user, register-user, update-user-role, ingest-webhook).
- `docs/` – Documentação complementar (ex.: modelo OKR, planejamento de features).
- `e2e/` – Testes end-to-end com Playwright.
- `.lovable/` – Configuração e planos de implementação (ex.: plano do Mapa de KR para tarefas).
- `index.html`, `vite.config.ts`, `tailwind.config.ts`, `vitest.config.ts`, `playwright.config.ts` – Configurações de build, estilo e testes.

---

## Como executar o projeto localmente

### Pré-requisitos

- **Git** instalado.
- **Node.js** compatível com Vite 5 e React 18.
- **npm** ou **bun** (o repositório inclui `bun.lock` / `package-lock.json`).
- Variáveis de ambiente para Supabase (URL e chave anônima), em `.env` ou ambiente.

### Passos básicos

1. **Clonar o repositório**

```bash
git clone https://github.com/pinn-product-builder/H2M-OKR-.git
cd H2M-OKR-
```

2. **Configurar variáveis de ambiente**

- Configure o arquivo `.env` com a URL e a chave anônima do projeto Supabase (e demais variáveis necessárias para auth e APIs).

3. **Instalar dependências**

```bash
npm install
```

ou, com Bun:

```bash
bun install
```

4. **Subir o servidor de desenvolvimento**

```bash
npm run dev
```

ou `bun run dev`. O Vite sobe o servidor (ex.: `http://localhost:5173`).

5. **Build para produção**

```bash
npm run build
```

6. **Preview do build**

```bash
npm run preview
```

7. **Testes**

```bash
npm run test
```

8. **Testes E2E (Playwright)**

```bash
npx playwright install
npx playwright test
```

9. **Executar com Docker**

```bash
docker compose up
```

(conforme definido em `docker-compose.yml` e `Dockerfile`).

---

## Contribuição

- Crie uma branch a partir da `main` (ex.: `feature/nome-da-feature`, `fix/descricao-curta`).
- Implemente as alterações respeitando padrões de código, testes e documentação.
- Atualize `README.md` ou documentação em `docs/` quando relevante.
- Abra um Pull Request com contexto, o que foi alterado e como testar.
- Aguarde revisão e aprovação de um responsável pelo repositório.

---

## Contato e suporte

Para dúvidas sobre o H2M OKR, entre em contato com o time responsável pelo produto ou pela área de dados da PINN.

- **Time de referência**: Pinn Product Builder  
- **E-mail**: projetos@pinnpb.com

---

## Licença e uso

Este projeto é de uso **interno** da PINN.  
A distribuição, cópia ou utilização fora dos termos acordados com a empresa **não é permitida**.
