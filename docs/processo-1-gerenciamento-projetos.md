### 3.3.1 Processo 1 – Gerenciamento de Projetos

O processo de Gerenciamento de Projetos tem como objetivo permitir a criação, edição, exclusão e acesso aos projetos acadêmicos pelos usuários do sistema, de acordo com seus respectivos papéis (líder ou membro).

Esse fluxo tem início com o acesso do usuário ao sistema, sendo necessário realizar o login ou, caso ainda não possua cadastro, efetuar o cadastro informando os dados solicitados. Após a autenticação, o usuário é direcionado para a tela de visualização de projetos, na qual são exibidos todos os projetos aos quais está vinculado.

Nessa tela, o usuário pode utilizar funcionalidades de busca e filtragem para localizar projetos específicos. A partir dessa tela, diferentes ações podem ser realizadas. Caso possua perfil de líder, o usuário poderá criar um novo projeto, informando os dados necessários para seu cadastro. Após a criação, o projeto passa a integrar a lista de projetos disponíveis.

Além disso, o líder pode editar projetos existentes, atualizando suas informações, ou excluí-los, mediante confirmação da ação. Já os membros possuem acesso restrito à visualização e ao acesso aos projetos.

Por fim, ao selecionar um projeto, o usuário acessa seus detalhes, permitindo o acesso a outros processos do sistema, como o gerenciamento de equipe e de tarefas.

Como oportunidade de melhoria em relação ao cenário atual, destaca-se a centralização das informações em um único ambiente, possibilitando melhor organização dos projetos e evitando a dispersão de dados em diferentes ferramentas. Além disso, o processo permite maior controle das ações realizadas pelos usuários, garantindo que apenas o líder tenha permissões de gerenciamento, enquanto os membros podem apenas visualizar e acessar os projetos.

#### Modelo BPMN

![Modelo BPMN do Processo de Gerenciamento de Projetos](images/gerenciamento_projetos.svg)

#### Detalhamento das atividades

As tabelas e colunas aparecem entre crases para facilitar a conferência no banco de dados.

**01. Acessar sistema - tabela `usuario`**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| `email`            | Texto    | obrigatório; usuário deve estar cadastrado | |
| `senha`            | Texto    | obrigatório; deve corresponder ao usuário | |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Entrar       | Visualizar projetos | default |
| Criar conta  | Cadastro | default |

![Tela de Login](images/processo_1/PROCESSO_1_LOGIN.png)

**02. Cadastro - tabela `usuario`**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| `id`               | Número   | gerado automaticamente | |
| `nome`             | Texto    | obrigatório; até 100 caracteres | |
| `sobrenome`        | Texto    | obrigatório; até 100 caracteres | |
| `email`            | Texto    | obrigatório; formato válido; único; até 150 caracteres | |
| `senha`            | Texto    | obrigatório; 6 a 255 caracteres | |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Criar conta  | Visualizar projetos | default |
| Cancelar     | Acessar sistema | cancel |

![Tela de Cadastro](images/processo_1/PROCESSO_1_CADASTRO.png)

**03. Visualizar projetos - tabelas `projeto` e `membro_equipe`**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| `membro_equipe.email` | Texto | corresponde ao usuário autenticado | |
| `membro_equipe.status` | Texto | somente vínculos com valor `ACEITO` | |
| `membro_equipe.data_saida` | Data e hora | deve estar vazio para projetos ativos do usuário | |
| `projeto.nome_projeto` | Texto | nome exibido na listagem | |
| `projeto.status` | Texto | valores `ATIVO` ou `CONCLUIDO` | |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Criar projeto | Criar projeto | default |
| Editar projeto | Editar projeto | default |
| Excluir projeto | Excluir projeto | default |
| Acessar projeto | Detalhes do projeto | default |

![Wireframe Tela de Visualizar Projetos](images/processo_1/PROCESSO_1_VISUALIZAR_PROJETOS.png)

**04. Criar projeto - tabelas `projeto` e `membro_equipe`**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| `projeto.nome_projeto` | Texto | obrigatório; 3 a 100 caracteres | |
| `projeto.descricao` | Texto | opcional; até 500 caracteres | |
| `projeto.capa_url` | Texto | opcional; imagem de capa | |
| `projeto.data_criacao` | Data | gerada automaticamente | data atual |
| `projeto.nome_equipe` | Texto | gerado automaticamente a partir do nome do projeto | `Equipe` + nome do projeto |
| `projeto.lider_email` | Texto | e-mail do usuário que criou o projeto | |
| `projeto.status` | Texto | valores `ATIVO` ou `CONCLUIDO` | `ATIVO` |
| `membro_equipe.projeto_id` | Número | relaciona o líder ao projeto criado | projeto atual |
| `membro_equipe.email` | Texto | e-mail do líder | |
| `membro_equipe.papel` | Texto | papel inicial do criador | `LIDER` |
| `membro_equipe.status` | Texto | vínculo inicial do criador | `ACEITO` |
| `membro_equipe.data_convite` | Data | gerada automaticamente | data atual |
| `membro_equipe.data_entrada` | Data | gerada automaticamente | data atual |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Salvar projeto | Visualizar projetos | default |
| Cancelar | Visualizar projetos | cancel |

![Wireframe Tela de Criar Projeto](images/processo_1/PROCESSO_1_NOVO_PROJETO.png)

**05. Editar projeto - tabela `projeto`**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| `nome_projeto`     | Texto    | obrigatório; 3 a 100 caracteres | valor atual |
| `descricao`        | Texto    | opcional; até 500 caracteres | valor atual |
| `capa_url`         | Texto    | opcional; imagem de capa | valor atual |
| `status`           | Texto    | valores `ATIVO` ou `CONCLUIDO` | valor atual |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Salvar alterações | Visualizar projetos | default |
| Cancelar | Visualizar projetos | cancel |

![Wireframe Tela de Editar Projeto](images/processo_1/PROCESSO_1_EDITAR_PROJETO.png)

**06. Excluir projeto - tabelas `projeto`, `tarefa`, `chat_mensagem` e `membro_equipe`**

A exclusão remove o registro da tabela `projeto` e os registros relacionados nas tabelas `tarefa`, `chat_mensagem` e `membro_equipe`.

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Confirmar exclusão | Visualizar projetos | default |
| Cancelar | Visualizar projetos | cancel |

![Wireframe Tela de Excluir Projeto](images/processo_1/PROCESSO_1_EXCLUIR_PROJETO.png)

**07. Acessar projeto - tabelas `projeto` e `membro_equipe`**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| `projeto.id`       | Número   | projeto selecionado deve existir | |
| `membro_equipe.status` | Texto | vínculo do usuário deve estar como `ACEITO` | |
| `membro_equipe.data_saida` | Data e hora | deve estar vazio | |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Abrir projeto | Detalhes do projeto | default |

![Wireframe Tela de Acessar Projeto](images/processo_1/PROCESSO_1_VISUALIZAR_PROJETO.png)
