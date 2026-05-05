### 3.3.5 Processo 5 – Gestão de Cronograma e Prazos

O processo de Gestão de Cronograma e Prazos tem como objetivo permitir o planejamento, a organização e o acompanhamento temporal das atividades relacionadas aos projetos acadêmicos. Por meio de um painel de controle, o usuário tem acesso a um calendário que centraliza eventos cadastrados e tarefas dos projetos, possibilitando uma visão integrada das responsabilidades e dos prazos.

O fluxo tem início com o acesso do usuário ao sistema, sendo necessário realizar o login ou, caso ainda não possua cadastro, efetuar o registro informando os dados solicitados. Após a autenticação, o usuário acessa o painel de controle, onde é apresentado o calendário com os eventos previamente cadastrados.

Nesse ambiente, o usuário pode interagir com o calendário realizando diferentes ações. É possível adicionar novos eventos, informando dados como título, descrição, data e horário. Além disso, o sistema permite visualizar os detalhes de eventos e tarefas ao selecioná-los no calendário. Também é possível editar eventos existentes, atualizando suas informações, ou excluí-los mediante confirmação.

Adicionalmente, as tarefas cadastradas nos projetos são exibidas automaticamente no calendário com base em seus respectivos prazos, permitindo uma visualização consolidada das atividades e facilitando o acompanhamento do cronograma.

Como oportunidade de melhoria, destaca-se a centralização das informações temporais em um único ambiente, o que contribui para uma melhor organização, redução de esquecimentos e maior controle sobre os prazos das atividades acadêmicas.

#### Modelo BPMN

![Modelo BPMN do Processo de Gestão de Cronograma e Prazos](images/gestao_cronograma.png)

#### Detalhamento das atividades
# Detalhamento das atividades

## 03. Visualizar calendário

| Campo              | Tipo               | Restrições                                           | Valor default          |
| ------------------ | ------------------ | ---------------------------------------------------- | ---------------------- |
| Mês/Ano            | Texto              | somente leitura; alterado via navegação             | mês atual              |
| Grade do calendário | Visual (grid)      | exibe dias do mês; inclui dias adjacentes (cinza)   |                        |
| Dias da semana     | Texto              | fixo (Domingo a Sábado)                             |                        |
| Eventos            | Tag/Label          | exibidos dentro do dia correspondente               |                        |
| Equipe (menu lateral) | Lista           | exibe equipes disponíveis                           |                        |

| Comandos               | Destino            | Tipo                   |
| ---------------------- | ------------------ | ---------------------- |
| < (mês anterior)       | Atualizar calendário | default                |
| > (próximo mês)        | Atualizar calendário | default                |
| Adicionar evento       | Criar evento         | default                |
| Selecionar dia         | Visualizar evento(s) | default                |

## 04. Criar / Visualizar evento

| Campo               | Tipo           | Restrições                                                 | Valor default            |
| ------------------- | -------------- | ---------------------------------------------------------- | ------------------------ |
| Nome do Evento      | Caixa de texto | obrigatório                                                |                          |
| Data                | Texto/Data     | obrigatório; vinculado ao dia selecionado                  | data selecionada         |
| Membros             | Lista          | opcional; exibe membros da equipe                          | nenhum                   |
| Descrição           | Área de texto  | opcional; limite sugerido (ex: 500 caracteres)             |                          |

| Comandos            | Destino            | Tipo                   |
| ------------------- | ------------------ | ---------------------- |
| Editar              | Habilitar edição    | default                |
| Salvar              | Atualizar evento    | default                |
| X (fechar)          | Voltar ao calendário | cancel                 |

## 05. Interação com eventos no calendário

| Ação                                 | Comportamento                                                      |
| ------------------------------------ | ------------------------------------------------------------------ |
| Clique em um evento                  | Abre modal de visualização/edição do evento                        |
| Clique em um dia vazio               | Permite criação de novo evento                                     |
| Hover no evento (Opcional)           | destacar visualmente                                               |
| Dias fora do mês                     | Exibidos com menor destaque visual (desabilitados)                 |
**01. Atividade 1**



![Wireframe](images/CALENDARIO.png)
![Wireframe](images/CALENDARIO-2.png)
![Wireframe](images/CALENDARIO-3.png)
![Wireframe](images/CALENDARIO-4.png)
