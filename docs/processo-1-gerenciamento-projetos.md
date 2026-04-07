### 3.3.1 Processo 1 – Gerenciamento de Projetos

O processo de gerenciamento de projetos tem como objetivo permitir a criação, edição, exclusão e acesso aos projetos acadêmicos pelos usuários do sistema, de acordo com seus respectivos papéis (líder ou membro).

Como oportunidade de melhoria em relação ao cenário atual, destaca-se a centralização das informações em um único ambiente, possibilitando melhor organização dos projetos e evitando a dispersão de dados em diferentes ferramentas. Além disso, o processo permite maior controle das ações realizadas pelos usuários, garantindo que apenas o líder tenha permissões de gerenciamento, enquanto os membros podem apenas visualizar e acessar os projetos.

#### Modelo BPMN

![Modelo BPMN do Processo de Gerenciamento de Projetos](images/gerenciamento_projetos.svg "Modelo BPMN do Processo de Gerenciamento de Projetos")

#### Detalhamento das atividades

**01. Visualizar projetos**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Projetos | Tabela | Exibir apenas projetos vinculados ao usuário logado |  |
| Buscar projeto | Caixa de texto | Opcional, até 100 caracteres |  |
| Filtro de status | Seleção múltipla | Valores: Ativo e/ou Concluído |  |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| criarProjeto | Criar projeto | default |
| editarProjeto | Editar projeto | default |
| excluirProjeto | Excluir projeto | default |
| acessarProjeto | Acessar projeto | default |
| aplicarFiltro | Visualizar projetos | default |
| limparFiltro | Visualizar projetos | cancel |


**02. Criar projeto**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Nome do projeto | Caixa de texto | Obrigatório, 3 a 100 caracteres |  |
| Descrição | Área de texto | Opcional, até 500 caracteres |  |
| Data de criação | Data | Gerado automaticamente pelo sistema, formato dd-mm-aaaa |  |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| salvarProjeto | Visualizar projetos | default |
| cancelarOperacao | Visualizar projetos | cancel |


**03. Editar projeto**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Nome do projeto | Caixa de texto | Obrigatório, 3 a 100 caracteres | Valor atual |
| Descrição | Área de texto | Opcional, até 500 caracteres | Valor atual |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| salvarAlteracoes | Visualizar projetos | default |
| cancelarOperacao | Visualizar projetos | cancel |


**04. Excluir projeto**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Confirmação de exclusão | Seleção única | Valores: Sim ou Não |  |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| confirmarExclusao | Visualizar projetos | default |
| cancelarOperacao | Visualizar projetos | cancel |


**05. Acessar projeto**

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Projeto selecionado | Seleção única | O projeto deve existir na lista |  |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| abrirProjeto | Detalhes do projeto | default |
