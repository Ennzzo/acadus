### 3.3.4 Processo 4 – Comunicação da equipe

O processo de Comunicação da Equipe tem como objetivo centralizar a troca de mensagens relacionadas aos projetos acadêmicos e permitir conversas privadas entre os usuários. O fluxo começa com o acesso ao sistema. Caso o usuário ainda não possua cadastro, deve criar uma conta e realizar o login antes de abrir a área de chats.

Após a autenticação, o usuário visualiza sua lista de conversas. Nessa tela, pode selecionar o chat de uma equipe da qual participa ou iniciar uma conversa privada informando o e-mail de outro usuário cadastrado. Ao abrir uma conversa, o sistema registra a leitura na tabela `chat_leitura` e apresenta as mensagens armazenadas em `chat_mensagem`. Caso o usuário já tenha saído de um projeto, o chat da equipe continua disponível apenas para consulta do histórico.

Quando a conversa permite interação, o usuário pode escrever uma mensagem e incluir anexos. A mensagem é salva em `chat_mensagem`. Se o envio ocorrer em uma conversa privada, o sistema também cria uma linha na tabela `notificacao` para avisar o destinatário. O usuário pode editar suas próprias mensagens, preservando o conteúdo anterior, ou realizar a exclusão lógica, mantendo o registro no banco com a indicação de mensagem excluída.

Por fim, o usuário pode ocultar uma conversa privada da própria lista. O mesmo pode ser feito com um chat de equipe após a saída do projeto. Nesse caso, o sistema registra a ação em `chat_oculto` sem apagar as mensagens do banco de dados. O processo termina quando o usuário encerra a consulta ou oculta a conversa.

#### Modelo BPMN

![Modelo BPMN do Processo de Comunicação da Equipe](images/chat_bpmn.svg)

#### Detalhamento das atividades

Os campos visíveis na interface são apresentados juntamente com sua origem no banco de dados. Quando necessário, também são descritas as regras de persistência utilizadas pelo sistema.

**01. Acessar chat da equipe ou conversa privada**

| **Campo visível na tela** | **Origem no banco**              | **Onde aparece**                 |
| ------------------------- | -------------------------------- | -------------------------------- |
| Nome do projeto           | projeto.nome_projeto             | lista de chats de equipe         |
| Nome do contato           | usuario.nome e usuario.sobrenome | lista de conversas privadas      |
| E-mail do contato         | usuario.email                    | nova conversa e lista de membros |
| Foto ou avatar            | usuario.foto_url                 | lista de chats e membros         |
| Prévia da última mensagem | chat_mensagem.conteudo           | lista de chats                   |
| Indicação de não lida     | chat_leitura.visualizado_ate     | lista de chats                   |
| Status somente leitura    | membro_equipe.data_saida         | chat de equipe após saída        |

**Regras de negócio**

* O acesso ao chat da equipe exige que `membro_equipe.status = ACEITO`.
* Quando `membro_equipe.data_saida` estiver preenchido, o usuário poderá apenas visualizar o histórico do chat.
* Conversas privadas são iniciadas a partir do e-mail de outro usuário cadastrado.

| **Comandos**             | **Destino**     | **Tipo** |
| ------------------------ | --------------- | -------- |
| Entrar no chat da equipe | Visualizar chat | default  |
| Iniciar conversa privada | Visualizar chat | default  |
| Voltar                   | Fim             | cancel   |

![Wireframe Tela de Acessar Chat](images/processo_4/PROCESSO_4_VISUALIZAR_PROJETO_PARA_ACESSAR_CHAT.png)

![Wireframe Tela de Modal Tipo Chat](images/processo_4/PROCESSO_4_MODAL_TIPO_CHAT.png)

**02. Visualizar chat**

| **Campo visível na tela**     | **Origem no banco**                                   | **Onde aparece**              |
| ----------------------------- | ----------------------------------------------------- | ----------------------------- |
| Nome da conversa              | projeto.nome_projeto ou usuario.nome                  | topo do chat                  |
| Quantidade de participantes   | membro_equipe                                         | topo do chat de equipe        |
| Nome do autor                 | chat_mensagem.autor_nome ou chat_mensagem.autor_email | mensagem                      |
| Horário da mensagem           | chat_mensagem.data_hora                               | mensagem                      |
| Texto da mensagem             | chat_mensagem.conteudo                                | mensagem                      |
| Anexo                         | chat_mensagem.anexo                                   | mensagem                      |
| Indicação de mensagem editada | chat_mensagem.editada                                 | mensagem                      |
| Mensagem excluída             | chat_mensagem.conteudo                                | mensagem removida logicamente |

**Regras de persistência**

* Mensagens são armazenadas em `chat_mensagem`.
* O campo `chat_mensagem.editada` indica alterações posteriores ao envio.
* O campo `chat_mensagem.excluida` identifica exclusões lógicas.
* A leitura da conversa é registrada em `chat_leitura`.
* O identificador da conversa utiliza:

  * `EQUIPE:<projeto_id>`
  * `PRIVADO:<email>:<email>`

| **Comandos**             | **Destino**               | **Tipo** |
| ------------------------ | ------------------------- | -------- |
| Enviar mensagem          | Atualizar chat            | default  |
| Editar mensagem própria  | Editar mensagem           | default  |
| Excluir mensagem própria | Excluir mensagem          | default  |
| Ocultar conversa         | Ocultar conversa da lista | default  |
| Apenas visualizar        | Fim                       | default  |

![Wireframe Tela de Visualizar Chat](images/processo_4/PROCESSO_4_VISUALIZAR_CHAT.png)

**03. Enviar mensagem**

| **Campo visível na tela** | **Origem no banco**    | **Onde aparece**  |
| ------------------------- | ---------------------- | ----------------- |
| Mensagem digitada         | chat_mensagem.conteudo | campo de mensagem |
| Anexo selecionado         | chat_mensagem.anexo    | área de anexos    |

**Regras de persistência**

* `chat_mensagem.autor_email` recebe o usuário autenticado.
* `chat_mensagem.tipo_chat` identifica se a conversa é de equipe ou privada.
* Em mensagens privadas, é criado um registro em `notificacao`.
* `notificacao.tipo = MENSAGEM_PRIVADA`.
* O destinatário é armazenado em `notificacao.destinatario_email`.

| **Comandos** | **Destino**     | **Tipo** |
| ------------ | --------------- | -------- |
| Enviar       | Atualizar chat  | default  |
| Cancelar     | Visualizar chat | cancel   |

![Wireframe Tela de Enviar Mensagem](images/processo_4/PROCESSO_4_VISUALIZAR_CHAT.png)

**04. Editar mensagem própria**

| **Campo visível na tela** | **Origem no banco**    | **Onde aparece** |
| ------------------------- | ---------------------- | ---------------- |
| Texto da mensagem         | chat_mensagem.conteudo | modal de edição  |
| Anexo da mensagem         | chat_mensagem.anexo    | modal de edição  |

**Regras de persistência**

* O conteúdo anterior é preservado em `chat_mensagem.conteudo_anterior`.
* O campo `chat_mensagem.editada` passa a possuir valor `true`.
* O anexo pode ser atualizado durante a edição.

| **Comandos**     | **Destino**     | **Tipo** |
| ---------------- | --------------- | -------- |
| Salvar alteração | Atualizar chat  | default  |
| Cancelar         | Visualizar chat | cancel   |

**05. Excluir mensagem própria**

| **Campo visível na tela** | **Origem no banco**    | **Onde aparece**     |
| ------------------------- | ---------------------- | -------------------- |
| Texto da mensagem         | chat_mensagem.conteudo | mensagem selecionada |
| Confirmação de exclusão   | tela de confirmação    | modal de exclusão    |

**Regras de persistência**

* O conteúdo anterior é preservado em `chat_mensagem.conteudo_anterior`.
* O conteúdo é substituído por “Mensagem excluída.”.
* O anexo é removido.
* O campo `chat_mensagem.excluida` passa a possuir valor `true`.

| **Comandos** | **Destino**     | **Tipo** |
| ------------ | --------------- | -------- |
| Confirmar    | Atualizar chat  | default  |
| Cancelar     | Visualizar chat | cancel   |

**06. Ocultar conversa da lista**

| **Campo visível na tela** | **Origem no banco**                  | **Onde aparece**   |
| ------------------------- | ------------------------------------ | ------------------ |
| Nome da conversa          | projeto.nome_projeto ou usuario.nome | topo do chat       |
| Confirmação de ocultação  | tela de confirmação                  | modal de ocultação |

**Regras de persistência**

* A ação é registrada na tabela `chat_oculto`.
* `chat_oculto.usuario_email` identifica quem ocultou a conversa.
* `chat_oculto.tipo_chat` identifica a conversa ocultada.
* `chat_oculto.oculto_ate` registra a data e hora da ocultação.
* As mensagens permanecem armazenadas no banco de dados.

| **Comandos**     | **Destino**                  | **Tipo** |
| ---------------- | ---------------------------- | -------- |
| Ocultar conversa | Atualizar lista de conversas | default  |
| Cancelar         | Visualizar chat              | cancel   |
