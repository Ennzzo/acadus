### 3.3.2 Processo 2 – Gestão de Grupos / Times

O processo de Gestão de Grupos / Times tem como objetivo facilitar a criação, organização e manutenção de grupos de trabalho, permitindo a definição de líderes, convite de membros, aprovação de entradas, remoção de membros e estruturação de subgrupos ou squads. Oportunidades de melhoria incluem reduzir o tempo de formação de times, aumentar a transparência na composição dos grupos e garantir a governança adequada sobre as equipes.

#### Modelo BPMN

![Modelo BPMN do PROCESSO de Gerenciamento de grupos](images/gerenciamento_equipe_bpmn.svg "Modelo BPMN do Processo de Gerenciamento de grupos.")

#### Detalhamento das atividades

**01. Criar equipe**

| **Campo**            | **Tipo**         | **Restrições**                          | **Valor default** |
|----------------------|------------------|-----------------------------------------|-------------------|
| Nome da Equipe       | Caixa de texto   | obrigatório; único                      |                   |
| Projeto Relacionado  | Texto            | somente leitura (conforme contexto)     |                   |

| **Comandos** | **Destino**           | **Tipo** |
|--------------|----------------------|----------|
| Criar        | Convidar membros     | default  |
| Cancelar     | Fim do processo      | cancel   |


**02. Convidar membros**

| **Campo**            | **Tipo**         | **Restrições**                    | **Valor default** |
|----------------------|------------------|----------------------------------|-------------------|
| E-mail do Membro     | Caixa de texto   | formato válido de e-mail         |                   |
| Papel Sugerido       | Seleção única    | membro / líder / observador      | membro            |
| Mensagem de Convite  | Área de texto    | opcional; até 300 caracteres     |                   |

| **Comandos**      | **Destino**              | **Tipo** |
|-------------------|--------------------------|----------|
| Enviar convite    | Aceitar convite?         | default  |
| Voltar            | Visualizar equipe        | cancel   |


**03. Aceitar convite?**

| **Campo**   | **Tipo**         | **Restrições**         | **Valor default** |
|-------------|------------------|------------------------|-------------------|
| Decisão     | Botão/Seleção    | aceitar ou recusar     |                   |

| **Comandos** | **Destino**                                      | **Tipo** |
|--------------|--------------------------------------------------|----------|
| Confirmar    | Sim: Visualizar equipe / Não: Fim do processo    | default  |


**04. Visualizar equipe**

| **Campo**           | **Tipo**     | **Restrições**                | **Valor default** |
|---------------------|--------------|-------------------------------|-------------------|
| Lista de Membros    | Tabela/Grid  | visualização dos integrantes  |                   |

| **Comandos**        | **Destino**         | **Tipo** |
|---------------------|--------------------|----------|
| Adicionar membro    | Convidar membros   | default  |
| Remover membro      | Remover membro     | default  |
| Editar equipe       | Editar equipe      | default  |
| Excluir equipe      | Excluir equipe     | default  |
| Sair/Fechar         | Fim                | default  |


**05. Remover membro**

| **Campo**            | **Tipo**         | **Restrições** | **Valor default** |
|----------------------|------------------|----------------|-------------------|
| Membro a Remover     | Seleção única    | obrigatório    |                   |
| Motivo da Remoção    | Área de texto    | opcional       |                   |

| **Comandos** | **Destino**                                                                 | **Tipo** |
|--------------|------------------------------------------------------------------------------|----------|
| Confirmar    | Se restar membros: Visualizar equipe / Se vazio: Excluir equipe             | default  |
| Cancelar     | Visualizar equipe                                                           | cancel   |


**06. Editar equipe**

| **Campo**            | **Tipo**         | **Restrições**              | **Valor default** |
|----------------------|------------------|-----------------------------|-------------------|
| Nome da Equipe       | Caixa de texto   | obrigatório; único          |                   |
| Projeto Relacionado  | Texto            | somente leitura             |                   |

| **Comandos** | **Destino**        | **Tipo** |
|--------------|-------------------|----------|
| Salvar       | Visualizar equipe | default  |
| Cancelar     | Visualizar equipe | cancel   |


**07. Excluir equipe**

| **Campo**            | **Tipo** | **Restrições** | **Valor default** |
|----------------------|----------|----------------|-------------------|
| Confirmação          | Texto    | informativo    |                   |

| **Comandos** | **Destino**       | **Tipo** |
|--------------|------------------|----------|
| Confirmar    | Fim do processo  | default  |
| Cancelar     | Visualizar equipe| cancel   |


**08. Listar equipes (CRUD)**

| **Campo**        | **Tipo**     | **Restrições**                 | **Valor default** |
|------------------|--------------|--------------------------------|-------------------|
| Lista de Equipes | Tabela/Grid  | visualizar todas as equipes    |                   |
| Filtro           | Caixa texto  | opcional                       |                   |

| **Comandos**        | **Destino**        | **Tipo** |
|---------------------|-------------------|----------|
| Nova equipe         | Criar equipe      | default  |
| Visualizar equipe   | Visualizar equipe | default  |
| Editar              | Editar equipe     | default  |
| Excluir             | Excluir equipe    | default  |


**09. Excluir grupo (automático)**

| **Campo**        | **Tipo** | **Restrições** | **Valor default** |
|------------------|----------|----------------|-------------------|
| Status Final     | Texto    | informativo    | grupo excluído    |

| **Comandos** | **Destino**       | **Tipo** |
|--------------|------------------|----------|
| Finalizar    | Fim              | default  |

#### Wireframes

![Wireframe do processo 2](images/processo_2.png "Wireframe")
