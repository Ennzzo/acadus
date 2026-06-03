### 3.3.3 Processo 3 – Gerenciamento de Tarefas

O processo de Gerenciamento de Tarefas tem como objetivo organizar, distribuir e acompanhar as atividades realizadas por membros de uma equipe dentro de um projeto acadêmico. As tarefas ficam organizadas em colunas configuráveis no quadro, permitindo controlar responsáveis, prazos, progresso, validação e lixeira.

O processo inicia-se com o usuário acessando o sistema. Em seguida, o usuário realiza o login para entrar na aplicação. Após autenticado, o sistema apresenta a área de gerenciamento de tarefas. Ressalta-se que, em um cenário completo, o sistema pode disponibilizar diferentes módulos, como gerenciamento de equipes e projetos; no entanto, para fins desta modelagem, considera-se o acesso direto ao módulo de gerenciamento de tarefas, por se tratar do escopo específico deste processo.

A partir desse ponto, o líder pode organizar as colunas do quadro, visualizar tarefas existentes ou criar uma nova tarefa. Caso opte por criar uma tarefa, informa os dados necessários, como nome, descrição, responsável e prazo, e salva o registro para execução.

Ao visualizar o quadro, os usuários podem acompanhar as tarefas e movimentá-las entre as colunas. O líder também pode editar tarefas, enviar registros para a lixeira, restaurar itens e excluir definitivamente tarefas ou colunas que já estejam na lixeira.

Se optar por editar, o líder altera as informações necessárias e salva as modificações. Ao enviar uma tarefa para a lixeira, o registro permanece no banco até que seja restaurado ou excluído definitivamente.

Paralelamente, o membro da equipe acessa o sistema, visualiza suas tarefas atribuídas e pode executá-las. Durante a execução, o membro pode atualizar o progresso da tarefa e, ao concluir, finalizá-la e enviá-la para validação.

Após o envio, o líder analisa a tarefa concluída. Caso esteja de acordo com os critérios estabelecidos, a tarefa é aprovada e deixa de aceitar alterações. Caso contrário, o líder solicita ajustes, e a tarefa retorna ao membro para correção e nova submissão.

O processo se encerra quando a tarefa é aprovada ou excluída definitivamente.

#### Modelo BPMN

![Modelo BPMN do Processo de Gerenciamento de Tarefas](images/gerenciamento_tarefas.png)

#### Detalhamento das atividades

Os nomes das tabelas e colunas foram mantidos como aparecem no banco de dados para facilitar a conferência em um visualizador como o Beekeeper Studio.

**01. Acessar sistema - tabela usuario**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| email            | Texto    | obrigatório; usuário deve estar cadastrado | |
| senha            | Texto    | obrigatório; deve corresponder ao usuário | |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Entrar | Visualizar tarefas | default |
| Criar conta | Cadastro | default |

![Tela de Login](images/processo_3/PROCESSO_3_LOGIN.png)

**02. Cadastro - tabela usuario**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| nome             | Texto    | obrigatório; até 100 caracteres | |
| sobrenome        | Texto    | obrigatório; até 100 caracteres | |
| email            | Texto    | obrigatório; formato válido; único; até 150 caracteres | |
| senha            | Texto    | obrigatório; 6 a 255 caracteres | |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Criar conta | Visualizar tarefas | default |
| Cancelar | Acessar sistema | cancel |

![Tela de Cadastro](images/processo_3/PROCESSO_3_CADASTRO.png)

**03. Visualizar quadro de tarefas - tabelas quadro_coluna e tarefa**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| quadro_coluna.projeto_id | Número | identifica o projeto atual | |
| quadro_coluna.nome | Texto | nome apresentado no quadro | |
| quadro_coluna.ordem | Número | define a posição da coluna | |
| quadro_coluna.excluida | Booleano | colunas com valor true aparecem na lixeira | false |
| tarefa.projeto_id | Número | lista somente tarefas do projeto atual | |
| tarefa.nome | Texto | nome apresentado no quadro | |
| tarefa.coluna | Texto | nome da coluna onde a tarefa aparece | |
| tarefa.ordem | Número | define a posição da tarefa dentro da coluna | |
| tarefa.status | Texto | valores PENDENTE, EM_ANDAMENTO, EM_VALIDACAO, APROVADA ou AJUSTES | PENDENTE |
| tarefa.excluida | Booleano | tarefas com valor true aparecem na lixeira | false |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Abrir tarefa | Visualizar ou editar tarefa | default |
| Adicionar tarefa | Criar tarefa | default |
| Gerenciar colunas | Atualizar quadro | default |
| Mover para lixeira | Lixeira de tarefas | default |

![Tela de Acesso ao Sistema de Gerenciamento de Tarefas](images/processo_3/PROCESSO_3_VISUALIZAR_TAREFAS.png)

**04. Gerenciar colunas do quadro - tabelas quadro_coluna e tarefa**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| quadro_coluna.projeto_id | Número | identifica o projeto atual | |
| quadro_coluna.nome | Texto | obrigatório; até 80 caracteres; não pode repetir no mesmo projeto | |
| quadro_coluna.ordem | Número | calculada automaticamente e atualizada ao reordenar | |
| quadro_coluna.excluida | Booleano | indica se a coluna está na lixeira | false |
| tarefa.coluna | Texto | atualizado quando uma coluna é renomeada | |

O líder pode criar, renomear e reordenar até 10 colunas ativas no quadro.

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Criar coluna | Atualizar quadro | default |
| Renomear coluna | Atualizar quadro | default |
| Reordenar colunas | Atualizar quadro | default |

**05. Criar tarefa - tabelas tarefa e notificacao**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| projeto_id       | Número   | identifica o projeto atual | |
| nome             | Texto    | obrigatório; 3 a 100 caracteres | |
| descricao        | Texto    | opcional; até 800 caracteres | |
| responsavel      | Texto    | opcional; armazena os membros atribuídos; até 1000 caracteres | |
| coluna           | Texto    | opcional; deve corresponder a uma coluna ativa; até 80 caracteres | A fazer |
| ordem            | Número   | calculada automaticamente dentro da coluna | |
| prazo            | Data     | opcional | |
| hora_prazo       | Texto    | opcional; até 5 caracteres | |
| comentario       | Texto    | opcional; até 5000 caracteres | |
| checklist        | Texto    | opcional; até 5000 caracteres | |
| anexo            | Texto    | opcional; armazena os anexos | |
| progresso        | Número   | calculado automaticamente a partir do checklist | 0 |
| status           | Texto    | situação inicial da tarefa | PENDENTE |
| excluida         | Booleano | indica se a tarefa está na lixeira | false |
| notificacao.tipo | Texto    | identifica o aviso enviado aos responsáveis | TAREFA |
| notificacao.referencia_id | Número | identifica a tarefa criada | |
| notificacao.projeto_id | Número | identifica o projeto atual | |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Salvar | Visualizar tarefas | default |
| Cancelar | Visualizar tarefas | cancel |

![Tela de Criar Tarefas](images/processo_3/PROCESSO_3_CRIAR_TAREFA.png)

**06. Visualizar ou editar tarefa - tabela tarefa**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| nome             | Texto    | obrigatório; 3 a 100 caracteres | valor atual |
| descricao        | Texto    | opcional; até 800 caracteres | valor atual |
| responsavel      | Texto    | opcional; armazena os membros atribuídos; até 1000 caracteres | valor atual |
| coluna           | Texto    | até 80 caracteres | valor atual |
| ordem            | Número   | define a posição da tarefa na coluna | valor atual |
| prazo            | Data     | opcional | valor atual |
| hora_prazo       | Texto    | opcional; até 5 caracteres | valor atual |
| comentario       | Texto    | opcional; até 5000 caracteres | valor atual |
| checklist        | Texto    | opcional; até 5000 caracteres | valor atual |
| anexo            | Texto    | opcional; armazena os anexos | valor atual |
| progresso        | Número   | recalculado automaticamente a partir do checklist | valor atual |
| status           | Texto    | situação atual da tarefa | valor atual |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Salvar alterações | Visualizar tarefas | default |
| Enviar para validação | Validação da tarefa | default |
| Mover para lixeira | Lixeira de tarefas | default |
| Fechar | Visualizar tarefas | cancel |

![Tela de Edição de Tarefas - Visualização do Líder](images/processo_3/PROCESSO_3_EDITAR_TAREFA.png)

**07. Mover tarefa no quadro - tabela tarefa**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| coluna             | Texto    | recebe o nome da coluna de destino | |
| ordem              | Número   | recebe a nova posição dentro da coluna | |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Arrastar tarefa | Atualizar quadro | default |

**08. Gerenciar lixeira - tabelas tarefa e quadro_coluna**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| excluida         | Booleano | o registro continua no banco enquanto estiver na lixeira | true |
| quadro_coluna.excluida | Booleano | ao mover uma coluna para a lixeira, suas tarefas também recebem excluida = true | true |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Mover para lixeira | Lixeira de tarefas | default |
| Restaurar | Visualizar tarefas | default |
| Excluir definitivamente | Fim do processo da tarefa | default |

Ao restaurar uma tarefa, tarefa.excluida volta para false e uma coluna ativa deve ser escolhida. Ao restaurar uma coluna, quadro_coluna.excluida volta para false e as tarefas desejadas podem ser recuperadas. Ao excluir definitivamente, os registros selecionados são removidos do banco.

**09. Executar tarefa e enviar para validação - tabelas tarefa e notificacao**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| checklist        | Texto    | registra os itens marcados pelo membro | valor atual |
| progresso        | Número   | calculado automaticamente a partir do checklist | valor atual |
| comentario       | Texto    | registra comentários e o envio para validação | valor atual |
| anexo            | Texto    | opcional; armazena os anexos | valor atual |
| status           | Texto    | passa para EM_VALIDACAO ao enviar e volta para EM_ANDAMENTO ao cancelar o envio ou iniciar ajustes | valor atual |
| notificacao.tipo | Texto    | identifica o aviso de validação ou ajuste | TAREFA |
| notificacao.referencia_id | Número | identifica a tarefa atualizada | |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Enviar para validação | Validar tarefa | default |
| Cancelar envio | Executar tarefa | cancel |
| Iniciar ajustes | Executar tarefa | default |
| Fechar | Visualizar tarefas | cancel |

![Tela de Visualização de Tarefas - Visualização do Membro](images/processo_3/PROCESSO_3_ENVIAR_VALIDACAO.png)

**10. Validar tarefa - tabelas tarefa e notificacao**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| status           | Texto    | passa para APROVADA ou AJUSTES | valor atual |
| comentario       | Texto    | registra aprovação ou ajustes solicitados | valor atual |
| notificacao.tipo | Texto    | identifica o aviso de aprovação ou ajuste | TAREFA |
| notificacao.referencia_id | Número | identifica a tarefa avaliada | |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Aprovar tarefa | Fim do processo da tarefa | default |
| Solicitar ajustes | Executar tarefa | default |

![Tela de Validação de Tarefas - Visualização do Líder](images/processo_3/PROCESSO_3_VALIDAR_TAREFA.png)
