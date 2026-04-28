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

![Wireframe Tela de Criar Equipe](images/processo_2/PROCESSO_2_CRIAR_EQUIPE.png)
![Wireframe Tela de Visualizar Projeto Editar Equipe](images/processo_2/PROCESSO_2_VISUALIZAR_PROJETO_EDITAR_EQUIPE.png)


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

![Wireframe Tela de Visualizar para Convidar Membros](images/processo_2/PROCESSO_2_VISUALIZAR_MEMBROS.png)

![Wireframe Tela de Convidar Membros](images/processo_2/PROCESSO_2_CONVIDAR_MEMBRO.png)

**03. Aceitar convite?**

| **Campo**   | **Tipo**         | **Restrições**         | **Valor default** |
|-------------|------------------|------------------------|-------------------|
| Decisão     | Botão/Seleção    | aceitar ou recusar     |                   |

| **Comandos** | **Destino**                                      | **Tipo** |
|--------------|--------------------------------------------------|----------|
| Confirmar    | Sim: Visualizar equipe / Não: Fim do processo    | default  |

![Wireframe Tela de Aceitar Convite](images/processo_2/PROCESSO_2_MODAL_CONVITE_MEMBRO.png)  

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

![Wireframe Tela de Visualizar Equipe](images/processo_2/PROCESSO_2_VISUALIZAR_MEMBROS.png)

**05. Remover membro**

| **Campo**            | **Tipo**         | **Restrições** | **Valor default** |
|----------------------|------------------|----------------|-------------------|
| Membro a Remover     | Seleção única    | obrigatório    |                   |
| Motivo da Remoção    | Área de texto    | opcional       |                   |

| **Comandos** | **Destino**                                                                 | **Tipo** |
|--------------|------------------------------------------------------------------------------|----------|
| Confirmar    | Se restar membros: Visualizar equipe / Se vazio: Excluir equipe             | default  |
| Cancelar     | Visualizar equipe                                                           | cancel   |

![Wireframe Tela de Remover Membro](images/processo_2/PROCESSO_2_CONFIRMAR_REMOCAO_MEMBRO.) 

**06. Editar equipe**

| **Campo**            | **Tipo**         | **Restrições**              | **Valor default** |
|----------------------|------------------|-----------------------------|-------------------|
| Nome da Equipe       | Caixa de texto   | obrigatório; único          |                   |
| Projeto Relacionado  | Texto            | somente leitura             |                   |

| **Comandos** | **Destino**        | **Tipo** |
|--------------|-------------------|----------|
| Salvar       | Visualizar equipe | default  |
| Cancelar     | Visualizar equipe | cancel   |

![Wireframe Tela de Remover Membro](images/processo_2/PROCESSO_2_EDITAR_EQUIPE.png) 

**07. Excluir equipe**

| **Campo**            | **Tipo** | **Restrições** | **Valor default** |
|----------------------|----------|----------------|-------------------|
| Confirmação          | Texto    | informativo    |                   |

| **Comandos** | **Destino**       | **Tipo** |
|--------------|------------------|----------|
| Confirmar    | Fim do processo  | default  |
| Cancelar     | Visualizar equipe| cancel   |

![Wireframe Tela de Remover Membro](images/processo_2/PROCESSO_2_CONFIRMAR_EXCLUIR_EQUIPE.png) 

**08. Excluir grupo (automático)**

| **Campo**        | **Tipo** | **Restrições** | **Valor default** |
|------------------|----------|----------------|-------------------|
| Status Final     | Texto    | informativo    | grupo excluído    |

| **Comandos** | **Destino**       | **Tipo** |
|--------------|------------------|----------|
| Finalizar    | Fim              | default  |


