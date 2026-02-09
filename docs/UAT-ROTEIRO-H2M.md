# Roteiro de User Acceptance Test (UAT) — H2M Intelligence

**Sistema:** H2M Intelligence (OKRs & Metas)  
**Versão do documento:** 1.0  
**Data:** _______________  
**Responsável UAT:** _______________

---

## 1. Objetivo e escopo

Este roteiro define os fluxos, casos de teste e checklists para a validação final do sistema H2M Intelligence antes da aprovação para produção. O UAT deve ser executado por usuários de negócio (e/ou product owner) com apoio da equipe de QA.

**Escopo do UAT:**
- Autenticação (login/cadastro)
- Dashboard
- Gestão de OKRs (ciclos, objetivos, KRs, tarefas)
- Data Source (importação e fontes)
- Usuários e permissões
- Configurações (setores)
- Comportamento com dados vazios/zerados
- Tratamento de erros e fluxos alternativos
- Desempenho em cenários críticos

**Sugestão:** Validar os pontos críticos listados na **Seção 2** com a equipe de QA antes de iniciar o UAT com os usuários de negócio.

---

## 2. Validação pré-UAT com QA

Antes de liberar o roteiro para os executores de UAT, a equipe de QA deve validar:

| # | Item | Validado (QA) | Observação |
|---|------|----------------|------------|
| 1 | Ambiente de teste (URL, credenciais de cada perfil) está estável e acessível | ☐ | |
| 2 | Dados de teste (OKRs, ciclos, setores, usuários por perfil) estão criados e documentados | ☐ | |
| 3 | Matriz de permissões (Seção 4) está alinhada com o comportamento esperado no código | ☐ | |
| 4 | Casos de dados vazios e erro (Seções 6 e 7) são reproduzíveis no ambiente | ☐ | |
| 5 | Critérios de performance (Seção 5) e ferramentas de medição estão definidos | ☐ | |
| 6 | Modelo de evidências (capturas/templates) foi combinado com os executores | ☐ | |

**Data da validação QA:** _______________  
**Responsável QA:** _______________

---

## 3. Fluxos e casos de teste por funcionalidade

### 3.1 Autenticação

| ID | Cenário | Passos | Resultado esperado | OK? | Evidência |
|----|---------|--------|-------------------|-----|-----------|
| AUTH-01 | Login com credenciais válidas | 1. Acessar /login 2. Informar e-mail e senha válidos 3. Submeter | Redirecionamento para Dashboard, sessão ativa | ☐ | |
| AUTH-02 | Login com senha inválida | 1. Acessar /login 2. E-mail válido, senha errada 3. Submeter | Mensagem de erro clara, sem redirecionar | ☐ | |
| AUTH-03 | Login com campos vazios | 1. Submeter sem preencher e-mail ou senha | Validação indicando campos obrigatórios | ☐ | |
| AUTH-04 | Senha com menos de 6 caracteres (cadastro) | 1. Aba "Criar conta" 2. Preencher nome, e-mail, senha &lt; 6 caracteres 3. Submeter | Mensagem: "A senha deve ter pelo menos 6 caracteres" | ☐ | |
| AUTH-05 | Cadastro com sucesso | 1. Preencher nome, e-mail, senha ≥ 6 2. Submeter | Conta criada, feedback de sucesso e/ou redirecionamento | ☐ | |
| AUTH-06 | Acesso a rota protegida sem login | 1. Sem estar logado, acessar URL da aplicação (ex.: /) | Redirecionamento para /login | ☐ | |
| AUTH-07 | Logout | 1. Estando logado, acionar logout | Sessão encerrada, redirecionamento para login | ☐ | |

---

### 3.2 Dashboard

| ID | Cenário | Passos | Resultado esperado | OK? | Evidência |
|----|---------|--------|-------------------|-----|-----------|
| DASH-01 | Visualização com dados existentes | 1. Login 2. Acessar Dashboard | Métricas, cards, visão por setor e OKRs exibidos conforme dados | ☐ | |
| DASH-02 | Dashboard sem OKRs (dados vazios) | 1. Usuário em ambiente sem OKRs cadastrados | Mensagem/estado vazio amigável, sem quebra ou tela em branco | ☐ | |
| DASH-03 | Dashboard sem setores | 1. Ambiente sem setores configurados | Tratamento para "sem setores" (mensagem ou ocultação de seção) | ☐ | |
| DASH-04 | Valores zerados em métricas | 1. OKRs com progresso 0% ou métricas zeradas | Exibição correta (0%, "0", etc.) sem erro visual ou de cálculo | ☐ | |
| DASH-05 | Troca de visualização/views (se aplicável) | 1. Selecionar outra view salva 2. Definir como padrão | Layout/dados atualizados; preferência salva | ☐ | |

---

### 3.3 Gestão de OKRs

| ID | Cenário | Passos | Resultado esperado | OK? | Evidência |
|----|---------|--------|-------------------|-----|-----------|
| OKR-01 | Listar ciclos ativos | 1. Acessar OKRs 2. Ver ciclos | Lista de ciclos com ativo destacado | ☐ | |
| OKR-02 | Criar novo ciclo | 1. Acionar "Novo ciclo" 2. Preencher label, datas, ativo 3. Salvar | Ciclo criado e exibido na lista | ☐ | |
| OKR-03 | Criar objetivo (OKR) | 1. Selecionar ciclo 2. Novo OKR 3. Título, setor, responsável, etc. 4. Salvar | OKR criado e vinculado ao ciclo | ☐ | |
| OKR-04 | Adicionar Key Result ao OKR | 1. Abrir OKR 2. Adicionar KR (tipo, meta, baseline, unidade, responsável) 3. Salvar | KR criado e exibido no OKR | ☐ | |
| OKR-05 | Criar tarefa com KR selecionado (dentro do modal) | 1. Abrir detalhe do OKR 2. Expandir KR 3. Nova tarefa 4. Preencher e salvar | Tarefa vinculada ao KR | ☐ | |
| OKR-06 | Criar tarefa pelo Mapa de KR (sem KR pré-selecionado) | 1. Abrir formulário de Nova Tarefa sem contexto de KR 2. Usar Mapa de KR para escolher OKR/KR 3. Selecionar KR 4. Preencher tarefa e salvar | Tarefa criada e vinculada ao KR escolhido | ☐ | |
| OKR-07 | Editar progresso de KR | 1. Abrir OKR 2. Atualizar valor atual de um KR | Progresso recalculado e exibido (barra, %) | ☐ | |
| OKR-08 | Formulário OKR/KR com campos obrigatórios vazios | 1. Tentar salvar OKR ou KR sem preencher obrigatórios | Validação indicando campos obrigatórios, formulário não submetido | ☐ | |
| OKR-09 | Lista de OKRs vazia (ciclo sem OKRs) | 1. Selecionar ciclo sem objetivos | Estado vazio com mensagem adequada | ☐ | |
| OKR-10 | Exclusão/arquivamento (se existir) | 1. Arquivar ou excluir OKR conforme regra de negócio | Ação confirmada e lista atualizada | ☐ | |

---

### 3.4 Data Source (fontes e importação)

| ID | Cenário | Passos | Resultado esperado | OK? | Evidência |
|----|---------|--------|-------------------|-----|-----------|
| DS-01 | Visualizar Data Source (com permissão) | 1. Login como admin ou gestor 2. Acessar Data Source | Tela de fontes e importação visível | ☐ | |
| DS-02 | Bloqueio de acesso (analista/visualizador) | 1. Login como analista ou visualizador 2. Acessar Data Source | Mensagem de acesso negado ou link não disponível | ☐ | |
| DS-03 | Nova fonte com mapeamento | 1. Nova fonte 2. Nome, tabela destino 3. Upload CSV (ou arquivo válido) 4. Mapear colunas 5. Confirmar importação | Fonte criada e registros importados; log disponível | ☐ | |
| DS-04 | Importação com arquivo inválido | 1. Upload de arquivo não suportado ou corrompido | Mensagem de erro clara (ex.: formato não suportado) | ☐ | |
| DS-05 | Importação com campos obrigatórios vazios no arquivo | 1. CSV com linhas sem valor em campo mapeado como obrigatório | Validação/erro indicando linha/coluna; tratamento sem quebra | ☐ | |
| DS-06 | Visualizar logs de importação | 1. Acessar histórico/logs de importação | Lista de imports com status (sucesso, erro, parcial) e detalhes | ☐ | |
| DS-07 | Excluir log/fonte (apenas admin) | 1. Como admin, excluir um log ou fonte | Exclusão confirmada e lista atualizada | ☐ | |
| DS-08 | Gestor não pode excluir (apenas visualizar/importar) | 1. Como gestor, tentar excluir log ou fonte | Botão desabilitado ou ação negada | ☐ | |

---

### 3.5 Usuários

| ID | Cenário | Passos | Resultado esperado | OK? | Evidência |
|----|---------|--------|-------------------|-----|-----------|
| USR-01 | Acesso à seção Usuários (apenas admin) | 1. Login como admin 2. Acessar Usuários | Lista de usuários com perfis (admin, gestor, analista, visualizador) | ☐ | |
| USR-02 | Não-admin não acessa gestão de usuários | 1. Login como gestor/analista/visualizador 2. Verificar menu/seção Usuários | Seção oculta ou acesso negado | ☐ | |
| USR-03 | Criar usuário (admin) | 1. Como admin, acionar criar usuário 2. E-mail, nome, perfil 3. Salvar | Usuário criado; toast/feedback de sucesso | ☐ | |
| USR-04 | Alterar perfil de usuário (admin) | 1. Como admin, alterar perfil de um usuário 2. Salvar | Perfil atualizado e refletido na lista | ☐ | |
| USR-05 | Lista de usuários vazia (apenas um admin) | 1. Ambiente com único usuário admin | Lista exibida com estado adequado, sem quebra | ☐ | |
| USR-06 | Erro ao criar usuário (ex.: e-mail duplicado) | 1. Criar usuário com e-mail já existente | Mensagem de erro clara (ex.: e-mail já cadastrado) | ☐ | |

---

### 3.6 Configurações (Setores)

| ID | Cenário | Passos | Resultado esperado | OK? | Evidência |
|----|---------|--------|-------------------|-----|-----------|
| CFG-01 | Acesso a Configurações (admin) | 1. Login como admin 2. Acessar Configurações | Gerenciador de setores visível | ☐ | |
| CFG-02 | Não-admin não gerencia setores | 1. Login como gestor/analista/visualizador 2. Acessar Configurações | Mensagem "Apenas administradores podem gerenciar setores" ou equivalente | ☐ | |
| CFG-03 | Adicionar setor | 1. Como admin, novo setor (nome, slug, etc.) 2. Salvar | Setor criado e listado | ☐ | |
| CFG-04 | Editar setor | 1. Editar nome/slug de setor existente 2. Salvar | Alteração persistida | ☐ | |
| CFG-05 | Lista de setores vazia | 1. Ambiente sem setores | Estado vazio com mensagem adequada | ☐ | |

---

## 4. Checklist de permissões por perfil

Utilize um usuário de cada perfil e marque o que deve ser **permitido** (P) ou **negado** (N).  
**Legenda:** C = Criar | E = Editar | V = Visualizar | X = Excluir

### 4.1 Matriz geral (sistema)

| Funcionalidade / Recurso | Admin | Gestor | Analista | Visualizador | Evidência (ex.: print) |
|--------------------------|-------|--------|----------|--------------|------------------------|
| Dashboard | V | V | V | V | |
| OKRs – Visualizar | V | V | V | V | |
| OKRs – Criar/Editar objetivos e KRs | C,E | C,E | E (só progresso) | N | |
| OKRs – Criar/Editar tarefas | C,E | C,E | Conforme regra | N | |
| Data Source – Visualizar | V | V | N | N | |
| Data Source – Importar | C | C | N | N | |
| Data Source – Excluir / Gerenciar mapeamentos | X / E | N / E | N | N | |
| Usuários – Visualizar e gerenciar | V,C,E | N | N | N | |
| Configurações (Setores) | V,C,E,X | N | N | N | |

### 4.2 Data Hub (detalhado)

| Ação | Admin | Gestor | Analista | Visualizador | OK? | Evidência |
|------|-------|--------|----------|--------------|-----|-----------|
| Ver seção Data Source | ☐ P | ☐ P | ☐ N | ☐ N | ☐ | |
| Nova fonte / Importar | ☐ P | ☐ P | ☐ N | ☐ N | ☐ | |
| Excluir fonte ou log | ☐ P | ☐ N | ☐ N | ☐ N | ☐ | |
| Gerenciar mapeamentos | ☐ P | ☐ P | ☐ N | ☐ N | ☐ | |

### 4.3 Itens personalizáveis (projeto)

| Recurso / Regra específica | Perfil(s) | Esperado (P/N) | OK? | Evidência |
|----------------------------|-----------|----------------|-----|-----------|
| _Ex.: Exportar relatório OKR_ | _admin, gestor_ | _P_ | ☐ | |
| _Ex.: Definir view padrão do dashboard_ | _todos_ | _P_ | ☐ | |
| _________________________ | __________ | ______ | ☐ | |

---

## 5. Testes de performance (cenários críticos)

Executar em ambiente com dados representativos (ou com grande volume, se aplicável). Registrar resultado (OK / Falha) e evidência (tempo, screenshot, ferramenta).

| ID | Cenário | Critério de aceite (sugestão) | Resultado | Evidência |
|----|---------|------------------------------|-----------|-----------|
| PERF-01 | Carregamento inicial da aplicação (Dashboard) | Tela útil em &lt; 5 s em conexão 3G simulada | ☐ | |
| PERF-02 | Listagem de OKRs (ciclo com muitos OKRs) | Lista renderizada em &lt; 3 s | ☐ | |
| PERF-03 | Abertura do modal de detalhe do OKR (com vários KRs e tarefas) | Modal aberto em &lt; 2 s | ☐ | |
| PERF-04 | Importação de arquivo grande (ex.: CSV 5.000+ linhas) | Conclusão ou feedback de progresso em tempo aceitável; sem travamento | ☐ | |
| PERF-05 | Navegação entre seções (Dashboard → OKRs → Data Source → Usuários) | Transição fluida, sem atraso perceptível | ☐ | |
| PERF-06 | Mapa de KR com muitos OKRs/KRs (seleção de KR para tarefa) | Lista expansível responsiva, sem congelar UI | ☐ | |

**Ferramentas sugeridas:** DevTools (Network, Performance), Lighthouse, extensão de throttle de rede.  
**Ambiente usado:** _______________  
**Volume de dados (ex.: nº de OKRs, linhas no CSV):** _______________

---

## 6. Dados vazios, zerados e ausentes

Validar que formulários, listas, relatórios e dashboard se comportam bem sem dados ou com valores zerados.

| ID | Local | Cenário | Resultado esperado | OK? | Evidência |
|----|-------|---------|-------------------|-----|-----------|
| VAZ-01 | Dashboard | Nenhum OKR cadastrado | Mensagem/estado vazio; sem erro ou tela em branco | ☐ | |
| VAZ-02 | Dashboard | Setores sem OKRs | Gráfico/seção tratado (zerado ou mensagem) | ☐ | |
| VAZ-03 | Dashboard | Progresso 0% em todos os KRs | Exibição de 0% ou "0" de forma consistente | ☐ | |
| VAZ-04 | OKRs | Ciclo sem objetivos | Estado vazio com CTA ou mensagem | ☐ | |
| VAZ-05 | OKRs | OKR sem Key Results | Estado vazio para lista de KRs | ☐ | |
| VAZ-06 | OKRs | KR sem tarefas | Lista de tarefas vazia com mensagem adequada | ☐ | |
| VAZ-07 | Formulários (OKR, KR, Tarefa) | Campos numéricos zerados ou vazios (quando permitido) | Aceito ou validação clara; sem crash | ☐ | |
| VAZ-08 | Data Source | Nenhuma fonte cadastrada | Estado vazio com opção de nova fonte | ☐ | |
| VAZ-09 | Data Source | Nenhum log de importação | Lista vazia ou mensagem | ☐ | |
| VAZ-10 | Usuários | Apenas um usuário na base | Lista exibida normalmente | ☐ | |
| VAZ-11 | Configurações | Nenhum setor | Estado vazio e opção de criar setor | ☐ | |

---

## 7. Mensagens de erro e fluxos alternativos

Verificar que as mensagens são claras e que fluxos de erro não deixam o usuário sem orientação.

### 7.1 Erros de rede / servidor

| ID | Cenário | Resultado esperado | OK? | Mensagem observada |
|----|---------|-------------------|-----|--------------------|
| ERR-01 | Sem conexão ao carregar Dashboard | Toast ou alerta de erro; retry ou instrução | ☐ | |
| ERR-02 | Falha na API ao salvar OKR/KR | Mensagem de erro e formulário preservado | ☐ | |
| ERR-03 | Timeout na importação | Mensagem de timeout ou "tente novamente" | ☐ | |

### 7.2 Validação e regras de negócio

| ID | Cenário | Resultado esperado | OK? | Mensagem observada |
|----|---------|-------------------|-----|--------------------|
| ERR-04 | Login: campos vazios | Validação em campo ou resumo | ☐ | |
| ERR-05 | Cadastro: senha &lt; 6 caracteres | "A senha deve ter pelo menos 6 caracteres" | ☐ | |
| ERR-06 | Criar usuário: e-mail duplicado | Mensagem indicando e-mail já existente | ☐ | |
| ERR-07 | Data Source: nome da fonte vazio | "Nome da fonte é obrigatório" ou similar | ☐ | |
| ERR-08 | Data Source: tabela de destino não selecionada | "Selecione uma tabela de destino" ou similar | ☐ | |
| ERR-09 | OKR/KR: campos obrigatórios vazios | Validação por campo (ex.: título, responsável) | ☐ | |
| ERR-10 | Tarefa sem KR selecionado (quando obrigatório) | "Selecione um Key Result" ou bloqueio de envio | ☐ | |

### 7.3 Rotas e acesso

| ID | Cenário | Resultado esperado | OK? | Evidência |
|----|---------|-------------------|-----|-----------|
| ERR-11 | URL inexistente (ex.: /pagina-inexistente) | Página 404 com mensagem e link para voltar | ☐ | |
| ERR-12 | Acesso a recurso sem permissão | Mensagem de acesso negado ou redirecionamento | ☐ | |

### 7.4 Itens personalizáveis (erros)

| Cenário de erro | Mensagem / comportamento esperado | OK? | Observação |
|-----------------|-----------------------------------|-----|------------|
| _________________________ | _________________________ | ☐ | |
| _________________________ | _________________________ | ☐ | |

---

## 8. Modelo de relatório para aprovação

Preencher ao final da execução do UAT para consolidar resultado e decisão.

### 8.1 Resumo executivo

| Item | Preenchimento |
|------|----------------|
| **Sistema** | H2M Intelligence |
| **Data de início do UAT** | |
| **Data de conclusão** | |
| **Ambiente** | (ex.: homologação, URL) |
| **Executores** | (nomes e perfis utilizados) |
| **Total de casos executados** | |
| **Aprovados** | |
| **Reprovados** | |
| **Bloqueados / Não executados** | |
| **Recomendação final** | ☐ Aprovado para produção  ☐ Aprovado com ressalvas  ☐ Reprovado |

### 8.2 Feedbacks consolidados

| Categoria | Descrição do feedback | Prioridade (P1/P2/P3) | Responsável correção |
|----------|------------------------|------------------------|----------------------|
| Funcional | Ex.: "Campo X não valida valor negativo" | | |
| Permissões | Ex.: "Gestor conseguiu acessar exclusão de log" | | |
| Performance | Ex.: "Importação de 10k linhas trava" | | |
| UX / Mensagens | Ex.: "Erro de rede genérico" | | |
| Dados vazios | Ex.: "Dashboard quebra sem setores" | | |
| _Outros_ | | | |

### 8.3 Prioridades de correção

| Prioridade | Descrição | Prazo sugerido |
|------------|-----------|----------------|
| **P1 – Bloqueante** | Impede uso em produção ou segurança | Antes do go-live |
| **P2 – Alto** | Impacto relevante; contornável | Sprint seguinte |
| **P3 – Melhoria** | Desejável; não bloqueia aprovação | Backlog |

### 8.4 Evidências anexadas

| Referência | Descrição breve | Arquivo (ex.: print, vídeo) |
|------------|-----------------|-----------------------------|
| EVD-01 | Ex.: Login com sucesso | login_ok.png |
| EVD-02 | Ex.: Dashboard vazio | dashboard_vazio.png |
| | | |
| _Incluir lista de anexos conforme combinado com a equipe_ | | |

### 8.5 Assinaturas e aprovação

| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| Executor(es) UAT | | | |
| Product Owner / Responsável negócio | | | |
| QA (validação técnica) | | | |

---

## 9. Compartilhamento e execução do UAT

### 9.1 Antes de iniciar

1. **QA** valida os itens da Seção 2 e libera o ambiente e os dados de teste.
2. **Distribuir** este roteiro (e eventual planilha de evidências) para os executores de UAT.
3. **Alinhar** com os executores:
   - Perfis de teste (admin, gestor, analista, visualizador) e credenciais.
   - Onde anexar evidências (pasta compartilhada, planilha, ferramenta).
   - Prazo de execução e data da reunião de conclusão.

### 9.2 Durante a execução

- Executar os casos na ordem desejada (por seção ou por prioridade).
- Marcar **OK?** e preencher **Evidência** em cada caso.
- Registrar mensagens de erro exatamente como aparecem na tela (Seção 7).
- Anotar em **Itens personalizáveis** qualquer cenário específico do projeto.

### 9.3 Após a execução

- Consolidar o **Relatório para aprovação** (Seção 8).
- Reunião de fechamento: apresentar resultados, P1/P2/P3 e decisão (aprovado / aprovado com ressalvas / reprovado).
- Arquivar roteiro preenchido e evidências para auditoria e histórico do projeto.

---

## 10. Histórico do documento

| Versão | Data | Alteração | Autor |
|--------|------|-----------|-------|
| 1.0 | | Criação do roteiro UAT H2M Intelligence | |

---

*Este roteiro foi elaborado para o projeto H2M Intelligence e pode ser ajustado conforme combinado com QA e product owner (itens personalizáveis e critérios de performance).*
