### 3.3.1 Processo 1 – Gerenciamento de Tarefas

O processo de gerenciamento de tarefas em projetos acadêmicos tem como objetivo organizar e acompanhar as atividades desenvolvidas pelas equipes, desde a criação do projeto até a conclusão das tarefas.

Como oportunidade de melhoria em relação ao cenário atual, destaca-se a centralização das informações em um único sistema, reduzindo a dispersão de dados entre diferentes ferramentas. Além disso, o processo proposto permite maior controle sobre prazos, responsabilidades e andamento das atividades, contribuindo para maior eficiência e produtividade das equipes.

#### Modelo BPMN

![Modelo BPMN do Processo de Gerenciamento de Tarefas](images/gerenciamento_tarefas.png "Modelo BPMN do Processo de Gerenciamento de Tarefas")

#### Detalhamento das atividades

**01. Criar projeto**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Nome do projeto | Caixa de texto | Obrigatório |  |
| Descrição | Área de texto | Opcional |  |
| Data de criação | Data | Automática | Data atual |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Criar | Adicionar membros | default |
| Cancelar | Fim do processo | cancel |


**02. Adicionar membros**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Usuários | Seleção múltipla | Pelo menos 1 membro |  |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Confirmar | Criar tarefa | default |
| Cancelar | Criar projeto | cancel |


**03. Criar tarefa**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Nome da tarefa | Caixa de texto | Obrigatório |  |
| Descrição | Área de texto | Opcional |  |
| Responsável | Seleção única | Obrigatório |  |
| Prazo | Data | Obrigatório |  |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Salvar | Executar tarefa | default |
| Cancelar | Adicionar membros | cancel |


**04. Executar tarefa**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Descrição | Área de texto | Opcional |  |
| Anexos | Arquivo | Opcional |  |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Marcar como concluída | Gateway (Tarefa concluída?) | default |


**05. Marcar tarefa como concluída**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Data de conclusão | Data | Automática | Data atual |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Confirmar | Fim do processo | default |


**Wireframe**

![Tela Criar Tarefa](images/Criar_Tarefa)
