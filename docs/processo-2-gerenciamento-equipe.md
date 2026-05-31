### 3.3.2 Processo 2 – Gerenciamento de Equipe

O processo de Gestão de Grupos / Times tem como objetivo facilitar a criação, organização e manutenção de grupos de trabalho, permitindo a definição de líderes, convite de membros, aprovação de entradas, remoção de membros e estruturação de subgrupos ou squads. Oportunidades de melhoria incluem reduzir o tempo de formação de times, aumentar a transparência na composição dos grupos e garantir a governança adequada sobre as equipes.

#### Modelo BPMN

![Modelo BPMN do Processo de Gerenciamento de Equipe](images/gerenciamento_equipe_bpmn.svg)

#### Detalhamento das atividades

As tabelas e colunas aparecem entre crases para facilitar a conferência no banco de dados. Não existe uma tabela separada para equipe: o nome da equipe fica armazenado no projeto.

**01. Criar equipe - tabela `projeto`**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| `nome_equipe`      | Texto    | obrigatório; 3 a 100 caracteres | `Equipe` + nome do projeto |
| `nome_projeto`     | Texto    | somente leitura nesta atividade | valor atual |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Salvar equipe | Visualizar equipe | default |
| Cancelar | Fim do processo | cancel |

![Wireframe Tela de Criar Equipe](images/processo_2/PROCESSO_2_CRIAR_EQUIPE.png)
![Wireframe Tela de Visualizar Projeto Editar Equipe](images/processo_2/PROCESSO_2_VISUALIZAR_PROJETO_EDITAR_EQUIPE.png)

**02. Convidar membro - tabela `membro_equipe`**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| `projeto_id`       | Número   | identifica o projeto da equipe | projeto atual |
| `email`            | Texto    | obrigatório; formato válido; até 150 caracteres | |
| `mensagem`         | Texto    | opcional; até 300 caracteres | |
| `papel`            | Texto    | novo convidado entra como membro | `MEMBRO` |
| `status`           | Texto    | situação inicial do convite | `PENDENTE` |
| `data_convite`     | Data     | gerada automaticamente | data atual |
| `transferencia_pendente` | Booleano | gerado automaticamente | `false` |
| `bloqueado`        | Booleano | gerado automaticamente | `false` |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Enviar convite | Aceitar ou recusar convite | default |
| Voltar | Visualizar equipe | cancel |

![Wireframe Tela de Visualizar para Convidar Membros](images/processo_2/PROCESSO_2_VISUALIZAR_MEMBROS.png)
![Wireframe Tela de Convidar Membros](images/processo_2/PROCESSO_2_CONVIDAR_MEMBRO.png)

**03. Aceitar ou recusar convite - tabela `membro_equipe`**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| `status`           | Texto    | altera de `PENDENTE` para `ACEITO` ou `RECUSADO` | `PENDENTE` |
| `data_entrada`     | Data     | preenchida automaticamente quando o convite é aceito | |
| `data_saida`       | Data e hora | permanece vazia quando o convite é aceito | |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Aceitar | Visualizar equipe | default |
| Recusar | Fim do processo | cancel |

![Wireframe Tela de Aceitar Convite](images/processo_2/PROCESSO_2_MODAL_CONVITE_MEMBRO.png)

**04. Visualizar equipe - tabelas `projeto` e `membro_equipe`**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| `projeto.nome_equipe` | Texto | nome apresentado para a equipe | |
| `projeto.lider_email` | Texto | e-mail do líder atual | |
| `membro_equipe.email` | Texto | identifica cada participante convidado | |
| `membro_equipe.papel` | Texto | valores `LIDER` ou `MEMBRO` | |
| `membro_equipe.status` | Texto | valores `PENDENTE`, `ACEITO` ou `RECUSADO` | |
| `membro_equipe.data_entrada` | Data | informa quando o convite foi aceito | |
| `membro_equipe.data_saida` | Data e hora | preenchida quando o membro sai da equipe | |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Adicionar membro | Convidar membro | default |
| Remover membro | Remover membro | default |
| Transferir liderança | Solicitar transferência de liderança | default |
| Editar equipe | Editar equipe | default |
| Sair da equipe | Confirmar saída | default |

![Wireframe Tela de Visualizar Equipe](images/processo_2/PROCESSO_2_VISUALIZAR_MEMBROS.png)

**05. Solicitar transferência de liderança - tabela `membro_equipe`**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| `transferencia_pendente` | Booleano | somente para membro ativo com `status = ACEITO` | `true` após a solicitação |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Transferir liderança | Responder transferência de liderança | default |
| Cancelar | Visualizar equipe | cancel |

**06. Responder transferência de liderança - tabelas `membro_equipe` e `projeto`**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| `membro_equipe.transferencia_pendente` | Booleano | volta para `false` após a resposta | `false` |
| `membro_equipe.papel` | Texto | ao aceitar, o novo líder recebe `LIDER` e o líder anterior recebe `MEMBRO` | |
| `projeto.lider_email` | Texto | atualizado com o e-mail do novo líder quando a transferência é aceita | |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Aceitar liderança | Visualizar equipe | default |
| Recusar | Visualizar equipe | cancel |

**07. Remover membro - tabela `membro_equipe`**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| `id`               | Número   | identifica o vínculo removido | |
| `data_saida`       | Data e hora | preenchida ao remover membro que já aceitou o convite | data e hora atuais |
| `transferencia_pendente` | Booleano | volta para `false` ao remover membro ativo | `false` |

Caso o convite ainda esteja com `status = PENDENTE`, o registro é excluído da tabela. Caso o membro já tenha aceitado, o registro é mantido como histórico com `data_saida` preenchida.

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Confirmar | Visualizar equipe com histórico atualizado | default |
| Cancelar | Visualizar equipe | cancel |

![Wireframe Tela de Remover Membro](images/processo_2/PROCESSO_2_CONFIRMAR_REMOCAO_MEMBRO.png)

**08. Editar equipe - tabela `projeto`**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| `nome_equipe`      | Texto    | obrigatório; 3 a 100 caracteres | valor atual |
| `nome_projeto`     | Texto    | somente leitura nesta atividade | valor atual |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Salvar | Visualizar equipe | default |
| Cancelar | Visualizar equipe | cancel |

![Wireframe Tela de Editar Equipe](images/processo_2/PROCESSO_2_EDITAR_EQUIPE.png)

**09. Sair da equipe - tabela `membro_equipe`**

| **Campo no banco** | **Tipo** | **Restrições** | **Valor default** |
|--------------------|----------|----------------|-------------------|
| `data_saida`       | Data e hora | preenchida automaticamente; líder deve transferir a liderança antes de sair | data e hora atuais |
| `transferencia_pendente` | Booleano | volta para `false` | `false` |

| **Comandos** | **Destino** | **Tipo** |
|--------------|-------------|----------|
| Confirmar | Fim do processo e histórico mantido | default |
| Cancelar | Visualizar equipe | cancel |

![Wireframe Tela de Confirmar Saída da Equipe](images/processo_2/PROCESSO_2_CONFIRMAR_EXCLUIR_EQUIPE.png)
