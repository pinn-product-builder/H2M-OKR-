

## Plano: Atualização rápida de progresso nos Key Results

### Problema
Atualmente, para atualizar o valor atual de um KR (ex: de 3 para 7), o usuário precisa abrir o formulário completo de edição do OKR. Isso é trabalhoso e impede o acompanhamento ágil do progresso. Os gráficos do dashboard dependem desses valores para refletir a evolução.

### Solução
Adicionar um botão "Atualizar Progresso" em cada KR dentro do modal de detalhes do OKR. Ao clicar, o campo "Valor Atual" se torna editável inline, permitindo salvar rapidamente o novo valor. A mudança dispara o `syncObjectiveProgress` existente, atualizando automaticamente todos os gráficos.

### Alterações

**1. `src/components/okr/OKRDetailModal.tsx` -- Componente KRItem**
- Adicionar um botão de ícone (TrendingUp ou Pencil) ao lado dos valores "Atual / Meta" em cada KR
- Ao clicar, exibir um input inline com o valor atual, botão de salvar e cancelar
- Ao salvar, chamar `useUpdateKeyResult` com o novo `current_value`
- O `syncObjectiveProgress` já existente no hook será acionado automaticamente, recalculando o progresso do OKR e atualizando o banco de dados
- A invalidação do query `['objectives']` fará os gráficos do dashboard atualizarem em tempo real

**2. Fluxo de atualização (já implementado no backend)**
- `useUpdateKeyResult` atualiza `current_value` no Supabase
- `syncObjectiveProgress` recalcula `progress` e `status` do OKR pai
- React Query invalida `['objectives']`, re-renderizando Dashboard, QuickStats e SectorOverview

### Resultado esperado
- Cada KR terá um botão de atualização rápida de progresso
- O usuário digita o novo valor atual e salva com um clique
- Os gráficos e indicadores do dashboard refletem a mudança imediatamente
- Sem necessidade de abrir o formulário completo de edição

