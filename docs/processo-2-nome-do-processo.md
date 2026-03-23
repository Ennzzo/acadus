### 3.3.2 Processo 2 – Atribuição Automática de Tarefas

_O processo de Atribuição Automática de Tarefas tem como objetivo distribuir tarefas aos usuários de forma automatizada, com base em critérios predefinidos, como disponibilidade, prioridade e carga de trabalho. Oportunidades de melhoria incluem reduzir o tempo de alocação manual, evitar sobrecarga de usuários e aumentar a rastreabilidade das tarefas._

![Modelo BPMN Atribuição Automática de Tarefas](images/process.png "Modelo BPMN do Processo 2.")

#### Detalhamento das atividades

**Receber solicitação de tarefa**

| **Campo**       | **Tipo**         | **Restrições** | **Valor default** |
| ---             | ---              | ---            | ---               |
| ID da Tarefa    | Campo numérico   | Automático, único |                   |
| Descrição       | Área de texto    | Obrigatório    |                   |
| Data da Criação | Data (dd-mm-aaaa) | Automático    | Data atual        |
| Data da Entrega | Data (dd-mm-aaaa) | Obrigatório   |                   |
| Prioridade      | Seleção única    | Alta, Média, Baixa | Média         |
| Anexo           | Arquivo          |                |                   |

| **Comandos**         |  **Destino**                   | **Tipo** |
| ---                  | ---                            | ---               |
| Confirmar            | Avaliar critérios de distribuição | default |
| Cancelar             | Fim do processo                | cancel            |

**Avaliar critérios de distribuição**

| **Campo**       | **Tipo**         | **Restrições** | **Valor default** |
| ---             | ---              | ---            | ---               |
| Carga de Trabalho do Usuário | Campo numérico | Somente leitura | 0 |
| Disponibilidade  | Seleção única    | Disponível, Ocupado, Ausente | Disponível |
| Habilidades Requeridas | Seleção única | Múltipla escolha | |
| Observação       | Área de texto    |                |                   |

| **Comandos**         |  **Destino**                   | **Tipo** |
| ---                  | ---                            | ---               |
| Propor usuários      | Selecionar usuário responsável | default |
| Reprocessar          | Avaliar critérios de distribuição | default |
| Cancelar             | Fim do processo                | cancel            |

**Selecionar usuário responsável**

| **Campo**       | **Tipo**         | **Restrições** | **Valor default** |
| ---             | ---              | ---            | ---               |
| Usuário Selecionado | Caixa de texto  | Obrigatório    |                   |
| Critério de Seleção | Seleção única   | Menor carga, Maior disponibilidade, Habilidade específica | Menor carga |

| **Comandos**         |  **Destino**                   | **Tipo** |
| ---                  | ---                            | ---               |
| Atribuir             | Atribuir tarefa                | default |
| Reavaliar            | Avaliar critérios de distribuição | default |
| Cancelar             | Fim do processo                | cancel            |

**Atribuir tarefa**

| **Campo**       | **Tipo**         | **Restrições** | **Valor default** |
| ---             | ---              | ---            | ---               |
| Data e Hora de Atribuição | Data e Hora (dd-mm-aaaa, hh:mm:ss) | Automático | Data e hora atuais |
| Notificação Enviada | Seleção única | Sim, Não | Não |
| Link para Tarefa | Link            | Automático     |                   |

| **Comandos**         |  **Destino**                   | **Tipo** |
| ---                  | ---                            | ---               |
| Enviar notificação e continuar | Monitorar e registrar status | default |
| Reatribuir           | Selecionar usuário responsável | default |
| Cancelar             | Fim do processo                | cancel            |

**Monitorar e registrar status**

| **Campo**       | **Tipo**         | **Restrições** | **Valor default** |
| ---             | ---              | ---            | ---               |
| Data de Entrega | Data (dd-mm-aaaa) |                |                   |
| Notificação Enviada | Seleção única | Sim, Não | Não |
| Comentários     | Área de texto    |                |                   |

| **Comandos**         |  **Destino**                   | **Tipo** |
| ---                  | ---                            | ---               |
| Finalizar            | Fim do processo                | default |
| Reabrir tarefa       | Avaliar critérios de distribuição | default ||
