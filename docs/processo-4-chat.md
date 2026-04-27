### 3.3.4 Processo 4 – Chat

O processo de Chat tem como objetivo centralizar a comunicação entre os membros da equipe e, quando necessário, com o professor, proporcionando um canal direto e organizado para troca de mensagens no contexto do projeto. Por meio dele, os usuários podem compartilhar informações, esclarecer dúvidas e alinhar atividades de forma rápida, sem depender de ferramentas externas.

#### Modelo BPMN

![Modelo BPMN do Processo de Acompanhamento com Quadro Kanban](images/chat_bpmn.svg "Modelo BPMN do Processo de Interação no Chat")

#### Detalhamento das atividades

**01. Acessar chat da equipe**

| **Campo**            | **Tipo**         | **Restrições**                          | **Valor default** |
|----------------------|------------------|-----------------------------------------|-------------------|
| Projeto              | Texto            | obrigatório; contexto do usuário        |                   |
| Tipo de Chat         | Seleção única    | equipe / equipe + professor             | equipe            |
| Usuário              | Texto            | autenticado                             |                   |

| **Comandos** | **Destino**           | **Tipo** |
|--------------|----------------------|----------|
| Entrar       | Visualizar chat      | default  |
| Voltar       | Fim                  | cancel   |

**01.1 Wireframe**

![Wireframe Tela de Acessar Chat](images/processo_4/Processo_2_VISUALIZAR_PROJETO_PARA_ACESSAR_CHAT.png "Wireframe Tela de Acessar Chat")

**01.2 Wireframe**

![Wireframe Tela de Modal Tipo Chat](images/processo_4/Processo_4_MODAL_TIPO_CHAT.png "Wireframe Tela de Modal Tipo Chat")

**02. Visualizar chat**

| **Campo**            | **Tipo**        | **Restrições**                          | **Valor default** |
|----------------------|-----------------|-----------------------------------------|-------------------|
| Lista de Mensagens   | Tabela/Feed     | ordenação por data/hora                 |                   |
| Participantes        | Lista           | membros da equipe/chat                  |                   |
| Status do Usuário    | Texto           | ativo / bloqueado                       | ativo             |

| **Comandos**        | **Destino**         | **Tipo** |
|---------------------|--------------------|----------|
| Enviar mensagem     | Enviar mensagem    | default  |
| Bloquear membro     | Bloquear membro    | default  |
| Desbloquear membro  | Desbloquear membro | default  |
| Sair                | Fim                | default  |

**02.1 Wireframe**

![Wireframe Tela de Visualizar Chat](images/processo_4/Processo_4_VISUALIZAR_CHAT.png "Wireframe Tela de Visualizar Chat")


**03. Enviar mensagem**

| **Campo**            | **Tipo**         | **Restrições**                          | **Valor default** |
|----------------------|------------------|-----------------------------------------|-------------------|
| Conteúdo             | Área de texto    | obrigatório; até 1000 caracteres        |                   |
| Anexo                | Upload           | opcional                                |                   |

| **Comandos** | **Destino**         | **Tipo** |
|--------------|--------------------|----------|
| Enviar       | Atualizar chat     | default  |
| Cancelar     | Visualizar chat    | cancel   |

**03.1 Wireframe**

![Wireframe Tela de Enviar Mensagem](images/processo_4/Processo_4_VISUALIZAR_CHAT.png "Wireframe Tela de Enviar Mensagem")

**04. Bloquear membro**

| **Campo**            | **Tipo**         | **Restrições**                  | **Valor default** |
|----------------------|------------------|---------------------------------|-------------------|
| Membro               | Seleção única    | obrigatório                     |                   |
| Motivo               | Área de texto    | opcional                        |                   |
| Tempo de bloqueio    | Seleção única    | temporário / permanente         | temporário        |

| **Comandos** | **Destino**      | **Tipo** |
|--------------|-----------------|----------|
| Confirmar    | Atualizar chat  | default  |
| Cancelar     | Visualizar chat | cancel   |

**04.1 Wireframe**

![Wireframe Tela de Editar Membro](images/processo_4/Processo_4_EDITAR_MEMBRO.png "Wireframe Tela de Editar Membro")


**04.2 Wireframe**

![Wireframe Tela de Bloquear Membro](images/processo_4/Processo_4_BLOQUEAR_MEMBRO.png "Wireframe Tela de Bloquear Membro")


**05. Desbloquear membro**

| **Campo**        | **Tipo**         | **Restrições** | **Valor default** |
|------------------|------------------|----------------|-------------------|
| Membro           | Seleção única    | obrigatório    |                   |

| **Comandos** | **Destino**      | **Tipo** |
|--------------|-----------------|----------|
| Confirmar    | Atualizar chat  | default  |
| Cancelar     | Visualizar chat | cancel   |


**05    .1 Wireframe**

![Wireframe Tela de Desbloquear Membro](images/processo_4/Processo_4_DESBLOQUEAR_MEMBRO.png "Wireframe Tela de Desbloquear Membro")



