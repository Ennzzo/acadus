### 3.3.4 Processo 4 – Comunicação da equipe

O processo de comunicação da equipe tem como objetivo centralizar a troca de mensagens entre participantes dos projetos e também permitir conversas privadas. O sistema registra mensagens, anexos, edições, exclusões lógicas, leitura e ocultação de conversas, ajudando a organizar a comunicação sem depender de ferramentas externas.

#### Modelo BPMN

![Modelo BPMN do Processo de Interação no Chat](images/chat_bpmn.svg)

#### Detalhamento das atividades

Os nomes das tabelas e colunas foram mantidos como aparecem no banco de dados para facilitar a conferência em um visualizador como o Beekeeper Studio.

**01. Acessar chat da equipe ou conversa privada - tabelas projeto, membro_equipe e usuario**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| projeto.id       | Número | identifica o chat da equipe selecionada | |
| membro_equipe.email | Texto | identifica o usuário no projeto | |
| membro_equipe.status | Texto | acesso ao chat da equipe exige valor ACEITO | |
| membro_equipe.data_saida | Data e hora | quando preenchida, o chat da equipe fica disponível somente para leitura | |
| usuario.email | Texto | utilizado para iniciar uma conversa privada | |
| usuario.foto_url | Texto | opcional; imagem exibida para identificar o usuário | |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Entrar no chat da equipe | Visualizar chat | default |
| Iniciar conversa privada | Visualizar chat | default |
| Voltar | Fim | cancel |

![Wireframe Tela de Acessar Chat](images/processo_4/PROCESSO_4_VISUALIZAR_PROJETO_PARA_ACESSAR_CHAT.png)
![Wireframe Tela de Modal Tipo Chat](images/processo_4/PROCESSO_4_MODAL_TIPO_CHAT.png)

**02. Visualizar chat - tabelas chat_mensagem e chat_leitura**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| projeto_id       | Número   | preenchido nas mensagens do chat de um projeto; vazio em conversa privada | |
| tipo_chat        | Texto    | valor EQUIPE ou identificação de conversa privada | |
| autor_email      | Texto    | identifica quem enviou a mensagem | |
| conteudo         | Texto    | conteúdo apresentado no chat | |
| anexo            | Texto    | opcional; armazena os anexos | |
| editada          | Booleano | indica se a mensagem foi alterada | false |
| excluida         | Booleano | indica se a mensagem foi excluída logicamente | false |
| data_hora        | Data e hora | define a ordem das mensagens | |
| chat_leitura.usuario_email | Texto | identifica quem visualizou a conversa | |
| chat_leitura.tipo_chat | Texto | usa EQUIPE:<projeto_id> ou PRIVADO:<email>:<email> para identificar a conversa | |
| chat_leitura.visualizado_ate | Data e hora | registra até qual momento a conversa foi lida | |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Enviar mensagem | Atualizar chat | default |
| Editar mensagem própria | Editar mensagem | default |
| Excluir mensagem própria | Excluir mensagem | default |
| Ocultar conversa | Ocultar conversa da lista | default |
| Bloquear membro | Bloquear membro | default |
| Desbloquear membro | Desbloquear membro | default |
| Sair | Fim | default |

![Wireframe Tela de Visualizar Chat](images/processo_4/PROCESSO_4_VISUALIZAR_CHAT.png)

**03. Enviar mensagem - tabelas chat_mensagem e notificacao**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| projeto_id       | Número   | projeto atual; permanece vazio em conversa privada | |
| autor_email      | Texto    | obrigatório; e-mail do usuário autenticado | |
| autor_nome       | Texto    | opcional; até 150 caracteres | |
| tipo_chat        | Texto    | EQUIPE ou PRIVADO:<email>:<email> | EQUIPE |
| conteudo         | Texto    | obrigatório; até 1000 caracteres | |
| anexo            | Texto    | opcional; armazena os anexos | |
| editada          | Booleano | gerado automaticamente | false |
| excluida         | Booleano | gerado automaticamente | false |
| data_hora        | Data e hora | gerada automaticamente | data e hora atuais |
| notificacao.tipo | Texto    | preenchido ao enviar uma mensagem privada | MENSAGEM_PRIVADA |
| notificacao.destinatario_email | Texto | e-mail do destinatário da conversa privada | |
| notificacao.remetente_email | Texto | e-mail do autor da mensagem privada | |
| notificacao.data_hora | Data e hora | gerada automaticamente | data e hora atuais |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Enviar | Atualizar chat | default |
| Cancelar | Visualizar chat | cancel |

![Wireframe Tela de Enviar Mensagem](images/processo_4/PROCESSO_4_VISUALIZAR_CHAT.png)

**04. Editar mensagem própria - tabela chat_mensagem**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| conteudo_anterior | Texto   | recebe o conteúdo anterior da mensagem | |
| conteudo         | Texto    | obrigatório; até 1000 caracteres | valor editado |
| anexo            | Texto    | opcional; armazena os anexos atualizados | valor editado |
| editada          | Booleano | alterado automaticamente | true |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Salvar alteração | Atualizar chat | default |
| Cancelar | Visualizar chat | cancel |

**05. Excluir mensagem própria - tabela chat_mensagem**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| conteudo_anterior | Texto   | recebe o conteúdo anterior da mensagem | |
| conteudo         | Texto    | mensagem é substituída por texto informativo | Mensagem excluída. |
| anexo            | Texto    | removido durante a exclusão lógica | vazio |
| excluida         | Booleano | alterado automaticamente | true |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Confirmar | Atualizar chat | default |
| Cancelar | Visualizar chat | cancel |

**06. Ocultar conversa da lista - tabela chat_oculto**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| usuario_email      | Texto    | identifica o usuário que ocultou a conversa | |
| tipo_chat          | Texto    | usa EQUIPE:<projeto_id> ou PRIVADO:<email>:<email> para identificar a conversa | |
| oculto_ate         | Data e hora | registra até qual momento a conversa foi ocultada | data e hora atuais |

Conversas privadas podem ser ocultadas da lista pelo próprio usuário. Chats de equipe podem ser ocultados após a saída do projeto. Essa ação não apaga as mensagens do banco.

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Ocultar conversa | Atualizar lista de conversas | default |
| Cancelar | Visualizar chat | cancel |

**07. Bloquear membro - tabela membro_equipe**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| bloqueado        | Booleano | atualizado pelo líder da equipe | true |
| motivo_bloqueio  | Texto    | opcional; até 300 caracteres | |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Confirmar | Atualizar chat | default |
| Cancelar | Visualizar chat | cancel |

![Wireframe Tela de Editar Membro](images/processo_4/PROCESSO_4_EDITAR_MEMBRO.png)
![Wireframe Tela de Bloquear Membro](images/processo_4/PROCESSO_4_BLOQUEAR_MEMBRO.png)

**08. Desbloquear membro - tabela membro_equipe**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| bloqueado        | Booleano | atualizado pelo líder da equipe | false |
| motivo_bloqueio  | Texto    | removido automaticamente | vazio |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Confirmar | Atualizar chat | default |
| Cancelar | Visualizar chat | cancel |

![Wireframe Tela de Desbloquear Membro](images/processo_4/PROCESSO_4_DESBLOQUEAR_MEMBRO.png)
