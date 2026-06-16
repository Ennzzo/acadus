package com.tis.acadus.seed;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.tis.acadus.entity.ChatMensagem;
import com.tis.acadus.entity.Equipe;
import com.tis.acadus.entity.EquipeUsuario;
import com.tis.acadus.entity.Evento;
import com.tis.acadus.entity.MembroEquipe;
import com.tis.acadus.entity.Notificacao;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.entity.QuadroColuna;
import com.tis.acadus.entity.Tarefa;
import com.tis.acadus.entity.Usuario;
import com.tis.acadus.entity.enums.PapelMembro;
import com.tis.acadus.entity.enums.StatusConvite;
import com.tis.acadus.entity.enums.StatusProjeto;
import com.tis.acadus.entity.enums.StatusTarefa;
import com.tis.acadus.repository.ChatMensagemRepository;
import com.tis.acadus.repository.EquipeRepository;
import com.tis.acadus.repository.EquipeUsuarioRepository;
import com.tis.acadus.repository.EventoRepository;
import com.tis.acadus.repository.MembroEquipeRepository;
import com.tis.acadus.repository.NotificacaoRepository;
import com.tis.acadus.repository.ProjetoRepository;
import com.tis.acadus.repository.QuadroColunaRepository;
import com.tis.acadus.repository.TarefaRepository;
import com.tis.acadus.repository.UsuarioRepository;

@Component
public class MvpDataSeeder {
    private static final String DEMO_EMAIL = "demo01@acadus.local";
    private static final String DEMO_PASSWORD = "123456";
    private static final String[] FIRST_NAMES = {
            "Ana", "Bruno", "Carla", "Diego", "Eduarda", "Felipe", "Gabriela", "Henrique", "Isabela", "Joao",
            "Karla", "Leonardo", "Marina", "Nicolas", "Olivia", "Pedro", "Quiteria", "Rafael", "Sofia", "Tiago"
    };
    private static final String[] LAST_NAMES = {
            "Almeida", "Barbosa", "Castro", "Dias", "Esteves", "Ferreira", "Gomes", "Horta", "Ibrahim", "Jardim",
            "Lima", "Mendes", "Nogueira", "Oliveira", "Pereira", "Queiroz", "Rocha", "Silva", "Teixeira", "Vieira"
    };
    private static final String[] PROJECT_NAMES = {
            "Portal Academico", "Gestao de Pesquisa", "Dashboard Institucional", "Biblioteca Digital",
            "Controle de Estagios", "Aplicativo de Mentoria", "Sistema de Eventos", "Painel Financeiro",
            "Central de Atendimento", "Ambiente de Avaliacoes", "Clube de Projetos", "Observatorio de Dados"
    };
    private static final String[] PROJECT_DESCRIPTIONS = {
            "Centraliza matriculas, documentos e solicitacoes academicas para alunos e secretaria.",
            "Acompanha editais, orientadores, grupos de estudo e entregas de iniciacao cientifica.",
            "Reune indicadores de evasao, frequencia, desempenho e participacao por curso.",
            "Organiza emprestimos, reservas, fichamentos e recomendacoes de acervo digital.",
            "Controla vagas, termos, supervisores e relatorios de acompanhamento de estagio.",
            "Conecta estudantes a mentores, agenda encontros e registra planos de desenvolvimento.",
            "Gerencia eventos, inscricoes, certificados e comunicados para a comunidade academica.",
            "Monitora bolsas, repasses, compras e planejamento orcamentario de projetos.",
            "Organiza chamados, prazos de resposta e historico de atendimento aos alunos.",
            "Planeja avaliacoes, rubricas, revisoes e devolutivas para professores e turmas.",
            "Acompanha squads, ideias, entregas e vitrines de projetos dos estudantes.",
            "Transforma bases institucionais em paineis de analise para coordenacoes."
    };
    private static final String[] COLUMNS = { "Backlog", "Em andamento", "Em validacao", "Concluido" };
    private static final String[] EVENT_COLORS = { "#2563eb", "#059669", "#d97706", "#dc2626", "#db2777", "#4338ca" };

    private final UsuarioRepository usuarioRepository;
    private final ProjetoRepository projetoRepository;
    private final MembroEquipeRepository membroEquipeRepository;
    private final EquipeRepository equipeRepository;
    private final EquipeUsuarioRepository equipeUsuarioRepository;
    private final QuadroColunaRepository quadroColunaRepository;
    private final TarefaRepository tarefaRepository;
    private final EventoRepository eventoRepository;
    private final ChatMensagemRepository chatMensagemRepository;
    private final NotificacaoRepository notificacaoRepository;

    public MvpDataSeeder(
            UsuarioRepository usuarioRepository,
            ProjetoRepository projetoRepository,
            MembroEquipeRepository membroEquipeRepository,
            EquipeRepository equipeRepository,
            EquipeUsuarioRepository equipeUsuarioRepository,
            QuadroColunaRepository quadroColunaRepository,
            TarefaRepository tarefaRepository,
            EventoRepository eventoRepository,
            ChatMensagemRepository chatMensagemRepository,
            NotificacaoRepository notificacaoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.projetoRepository = projetoRepository;
        this.membroEquipeRepository = membroEquipeRepository;
        this.equipeRepository = equipeRepository;
        this.equipeUsuarioRepository = equipeUsuarioRepository;
        this.quadroColunaRepository = quadroColunaRepository;
        this.tarefaRepository = tarefaRepository;
        this.eventoRepository = eventoRepository;
        this.chatMensagemRepository = chatMensagemRepository;
        this.notificacaoRepository = notificacaoRepository;
    }

    @Transactional
    public void seedIfEmpty() {
        if (usuarioRepository.findByEmailIgnoreCase(DEMO_EMAIL).isPresent()) {
            refreshDemoCommunicationData();
            return;
        }

        List<Usuario> usuarios = criarUsuarios();
        List<Projeto> projetos = criarProjetos(usuarios);
        criarColunasTarefasEventosChatsENotificacoes(usuarios, projetos);
        criarChatsPrivados(usuarios);
    }

    @Transactional
    public void refreshDemoCommunicationData() {
        Set<String> demoEmails = demoEmails();
        List<Usuario> usuarios = usuarioRepository.findAll().stream()
                .filter(usuario -> demoEmails.contains(lower(usuario.getEmail())))
                .toList();
        List<Projeto> projetos = demoProjects(demoEmails);
        Set<Long> demoProjectIds = projetos.stream()
                .map(Projeto::getId)
                .collect(java.util.stream.Collectors.toSet());

        deleteDemoCommunicationData(demoEmails, demoProjectIds);
        criarChatsENotificacoes(usuarios, projetos);
        criarChatsPrivados(usuarios);
    }

    @Transactional
    public void deleteDemoData() {
        Set<String> demoEmails = demoEmails();
        List<Projeto> demoProjects = demoProjects(demoEmails);
        Set<Long> demoProjectIds = demoProjects.stream()
                .map(Projeto::getId)
                .collect(java.util.stream.Collectors.toSet());

        deleteDemoCommunicationData(demoEmails, demoProjectIds);

        if (!demoProjectIds.isEmpty()) {
            eventoRepository.deleteAll(eventoRepository.findAll().stream()
                    .filter(evento -> evento.getProjetoId() != null && demoProjectIds.contains(evento.getProjetoId()))
                    .toList());
            tarefaRepository.deleteAll(tarefaRepository.findAll().stream()
                    .filter(tarefa -> tarefa.getProjeto() != null && demoProjectIds.contains(tarefa.getProjeto().getId()))
                    .toList());
            quadroColunaRepository.deleteAll(quadroColunaRepository.findAll().stream()
                    .filter(coluna -> coluna.getProjeto() != null && demoProjectIds.contains(coluna.getProjeto().getId()))
                    .toList());
            membroEquipeRepository.deleteAll(membroEquipeRepository.findAll().stream()
                    .filter(membro -> membro.getProjeto() != null && demoProjectIds.contains(membro.getProjeto().getId()))
                    .toList());

            List<Equipe> demoTeams = equipeRepository.findAll().stream()
                    .filter(equipe -> equipe.getProjeto() != null && demoProjectIds.contains(equipe.getProjeto().getId()))
                    .toList();
            Set<Long> demoTeamIds = demoTeams.stream()
                    .map(Equipe::getId)
                    .collect(java.util.stream.Collectors.toSet());
            equipeUsuarioRepository.deleteAll(equipeUsuarioRepository.findAll().stream()
                    .filter(vinculo -> vinculo.getEquipe() != null && demoTeamIds.contains(vinculo.getEquipe().getId()))
                    .toList());
            equipeRepository.deleteAll(demoTeams);

            for (Projeto projeto : demoProjects) {
                projeto.setEquipe(new ArrayList<>());
                projetoRepository.save(projeto);
            }
            projetoRepository.deleteAll(demoProjects);
        }

        usuarioRepository.deleteAll(usuarioRepository.findAll().stream()
                .filter(usuario -> demoEmails.contains(usuario.getEmail().toLowerCase()))
                .toList());
    }

    private List<Projeto> demoProjects(Set<String> demoEmails) {
        Set<String> projectNames = new HashSet<>(Arrays.asList(PROJECT_NAMES));
        return projetoRepository.findAll().stream()
                .filter(projeto -> projectNames.contains(projeto.getNomeProjeto()))
                .filter(projeto -> projeto.getLiderEmail() != null && demoEmails.contains(projeto.getLiderEmail().toLowerCase()))
                .toList();
    }

    private void deleteDemoCommunicationData(Set<String> demoEmails, Set<Long> demoProjectIds) {
        notificacaoRepository.deleteAll(notificacaoRepository.findAll().stream()
                .filter(notificacao -> demoEmails.contains(lower(notificacao.getDestinatarioEmail()))
                        || demoEmails.contains(lower(notificacao.getRemetenteEmail()))
                        || (notificacao.getProjetoId() != null && demoProjectIds.contains(notificacao.getProjetoId())))
                .toList());
        chatMensagemRepository.deleteAll(chatMensagemRepository.findAll().stream()
                .filter(mensagem -> demoEmails.contains(lower(mensagem.getAutorEmail()))
                        || isPrivateDemoChat(mensagem.getTipoChat(), demoEmails)
                        || (mensagem.getProjeto() != null && demoProjectIds.contains(mensagem.getProjeto().getId())))
                .toList());
    }

    private boolean isPrivateDemoChat(String tipoChat, Set<String> demoEmails) {
        if (tipoChat == null || !tipoChat.startsWith("PRIVADO:")) {
            return false;
        }
        return demoEmails.stream().anyMatch(tipoChat.toLowerCase()::contains);
    }

    private String lower(String value) {
        return value == null ? "" : value.toLowerCase();
    }

    private Set<String> demoEmails() {
        Set<String> emails = new HashSet<>();
        for (int i = 1; i <= 100; i++) {
            emails.add("demo" + String.format("%02d", i) + "@acadus.local");
        }
        return emails;
    }

    private List<Usuario> criarUsuarios() {
        List<Usuario> usuarios = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            String nome = FIRST_NAMES[i % FIRST_NAMES.length];
            String sobrenome = LAST_NAMES[(i / FIRST_NAMES.length + i) % LAST_NAMES.length];
            usuarios.add(Usuario.builder()
                    .nome(nome)
                    .sobrenome(sobrenome)
                    .email("demo" + String.format("%02d", i + 1) + "@acadus.local")
                    .senha(DEMO_PASSWORD)
                    .fotoUrl(null)
                    .build());
        }
        return usuarioRepository.saveAll(usuarios);
    }

    private List<Projeto> criarProjetos(List<Usuario> usuarios) {
        List<Projeto> projetos = new ArrayList<>();
        for (int i = 0; i < PROJECT_NAMES.length; i++) {
            Usuario lider = usuarios.get(i * 3);
            Projeto projeto = Projeto.builder()
                    .nomeProjeto(PROJECT_NAMES[i])
                    .nome(PROJECT_NAMES[i])
                    .descricao(PROJECT_DESCRIPTIONS[i])
                    .dataCriacao(LocalDate.now().minusDays(45L - i))
                    .nomeEquipe("Equipe " + PROJECT_NAMES[i])
                    .liderEmail(lider.getEmail())
                    .status(i == PROJECT_NAMES.length - 1 ? StatusProjeto.CONCLUIDO : StatusProjeto.ATIVO)
                    .equipe(new ArrayList<>())
                    .build();
            projetos.add(projetoRepository.save(projeto));

            Equipe equipe = equipeRepository.save(Equipe.builder()
                    .nome(projeto.getNomeEquipe())
                    .projeto(projeto)
                    .build());

            int inicio = i * 8;
            List<Usuario> membrosProjeto = new ArrayList<>();
            membrosProjeto.add(lider);
            for (int j = 0; j < 11; j++) {
                membrosProjeto.add(usuarios.get((inicio + j + 1) % usuarios.size()));
            }
            projeto.setEquipe(membrosProjeto);
            projetoRepository.save(projeto);

            for (Usuario usuario : membrosProjeto) {
                boolean isLeader = usuario.getEmail().equalsIgnoreCase(lider.getEmail());
                membroEquipeRepository.save(MembroEquipe.builder()
                        .email(usuario.getEmail())
                        .papel(isLeader ? PapelMembro.LIDER : PapelMembro.MEMBRO)
                        .mensagem(isLeader ? "Criador do projeto." : "Convite aceito para participar do projeto.")
                        .convidadoPor(lider.getEmail())
                        .transferenciaPendente(false)
                        .bloqueado(false)
                        .removido(false)
                        .ocultoLista(false)
                        .status(StatusConvite.ACEITO)
                        .dataConvite(projeto.getDataCriacao())
                        .dataEntrada(projeto.getDataCriacao().atTime(9, 0).plusDays(1))
                        .projeto(projeto)
                        .build());
                equipeUsuarioRepository.save(EquipeUsuario.builder()
                        .equipe(equipe)
                        .usuario(usuario)
                        .build());
            }
        }
        return projetos;
    }

    private void criarColunasTarefasEventosChatsENotificacoes(List<Usuario> usuarios, List<Projeto> projetos) {
        for (int i = 0; i < projetos.size(); i++) {
            Projeto projeto = projetos.get(i);
            List<MembroEquipe> membros = membroEquipeRepository.findByProjetoIdOrderByIdAsc(projeto.getId());
            criarColunas(projeto);
            criarTarefas(projeto, membros, i);
            criarEventos(projeto, membros, i);
        }
        criarChatsENotificacoes(usuarios, projetos);
    }

    private void criarChatsENotificacoes(List<Usuario> usuarios, List<Projeto> projetos) {
        for (int i = 0; i < projetos.size(); i++) {
            Projeto projeto = projetos.get(i);
            List<MembroEquipe> membros = membroEquipeRepository.findByProjetoIdOrderByIdAsc(projeto.getId());
            criarChat(projeto, usuarios, membros, i);
            criarChatsPrivadosDoProjeto(projeto, usuarios, membros, i);
            criarNotificacoes(projeto, membros, i);
        }
    }

    private void criarColunas(Projeto projeto) {
        for (int i = 0; i < COLUMNS.length; i++) {
            quadroColunaRepository.save(QuadroColuna.builder()
                    .nome(COLUMNS[i])
                    .ordem(i)
                    .excluida(false)
                    .projeto(projeto)
                    .build());
        }
    }

    private void criarTarefas(Projeto projeto, List<MembroEquipe> membros, int projectIndex) {
        for (int i = 0; i < 18; i++) {
            MembroEquipe membroA = membros.get(i % membros.size());
            MembroEquipe membroB = membros.get((i + 2) % membros.size());
            StatusTarefa status = statusTarefa(i);
            int progresso = status == StatusTarefa.APROVADA ? 100 : Math.min(90, 15 + i * 5);
            tarefaRepository.save(Tarefa.builder()
                    .nome(nomeTarefa(i))
                    .descricao(descricaoTarefa(projeto, i))
                    .responsavel(membroA.getEmail() + ", " + membroB.getEmail())
                    .coluna(COLUMNS[i % COLUMNS.length])
                    .ordem(i)
                    .excluida(false)
                    .prazo(LocalDate.now().plusDays((projectIndex * 2L) + i - 9))
                    .horaPrazo(String.format("%02d:00", 9 + (i % 8)))
                    .progresso(progresso)
                    .comentario(comentariosJson(membroA.getEmail(), membroB.getEmail(), projeto, i))
                    .checklist(checklistTexto(projeto, i))
                    .anexo("[]")
                    .status(status)
                    .projeto(projeto)
                    .build());
        }

        tarefaRepository.save(Tarefa.builder()
                .nome("Tarefa arquivada para teste da lixeira")
                .descricao("Solicitacao antiga de ajuste no fluxo de importacao que foi cancelada apos revisao da equipe.")
                .responsavel(membros.get(0).getEmail())
                .coluna(COLUMNS[0])
                .ordem(99)
                .excluida(true)
                .prazo(LocalDate.now().minusDays(3))
                .horaPrazo("14:00")
                .progresso(20)
                .comentario("[]")
                .checklist("Conferir solicitacao original\nRegistrar motivo do cancelamento\nValidar historico na lixeira")
                .anexo("[]")
                .status(StatusTarefa.PENDENTE)
                .projeto(projeto)
                .build());
    }

    private void criarEventos(Projeto projeto, List<MembroEquipe> membros, int projectIndex) {
        for (int i = 0; i < 18; i++) {
            List<Long> membrosIds = List.of(
                    membros.get(i % membros.size()).getId(),
                    membros.get((i + 3) % membros.size()).getId());
            eventoRepository.save(new Evento(
                    nomeEvento(i),
                    descricaoEvento(projeto, i),
                    LocalDate.now().plusDays(i - 5L + projectIndex),
                    projeto.getId(),
                    null,
                    null,
                    membrosIds,
                    EVENT_COLORS[i % EVENT_COLORS.length]));
        }
    }

    private void criarChat(Projeto projeto, List<Usuario> usuarios, List<MembroEquipe> membros, int projectIndex) {
        for (int i = 0; i < 48; i++) {
            MembroEquipe membro = membros.get(i % membros.size());
            Usuario autor = usuarios.stream()
                    .filter(usuario -> usuario.getEmail().equalsIgnoreCase(membro.getEmail()))
                    .findFirst()
                    .orElse(usuarios.get(0));
            chatMensagemRepository.save(ChatMensagem.builder()
                    .autorEmail(autor.getEmail())
                    .autorNome(autor.getNome() + " " + autor.getSobrenome())
                    .tipoChat("EQUIPE")
                    .conteudo(mensagemChat(projeto, i))
                    .anexo(null)
                    .editada(false)
                    .excluida(false)
                    .dataHora(LocalDateTime.now().minusDays(3).plusHours(projectIndex + i))
                    .projeto(projeto)
                    .build());
        }
    }

    private void criarNotificacoes(Projeto projeto, List<MembroEquipe> membros, int projectIndex) {
        for (int i = 0; i < membros.size(); i++) {
            MembroEquipe membro = membros.get(i);
            for (int j = 0; j < 3; j++) {
                int notificationIndex = i + j;
                notificacaoRepository.save(Notificacao.builder()
                        .destinatarioEmail(membro.getEmail())
                        .tipo(tipoNotificacao(notificationIndex))
                        .referenciaId(projeto.getId() + notificationIndex)
                        .projetoId(projeto.getId())
                        .projetoNome(projeto.getNomeProjeto())
                        .equipeNome(projeto.getNomeEquipe())
                        .remetenteEmail(projeto.getLiderEmail())
                        .remetenteNome("Lider do projeto")
                        .mensagem(mensagemNotificacao(projeto, notificationIndex))
                        .status(notificationIndex % 2 == 0 ? "LIDA" : "NOVA")
                        .titulo(tituloNotificacao(notificationIndex))
                        .texto(textoNotificacao(projeto, notificationIndex))
                        .dataHora(LocalDateTime.now().minusHours(projectIndex + i + j))
                        .build());
            }
        }
    }

    private void criarChatsPrivadosDoProjeto(Projeto projeto, List<Usuario> usuarios, List<MembroEquipe> membros, int projectIndex) {
        for (int i = 0; i < membros.size(); i++) {
            for (int j = i + 1; j < membros.size(); j++) {
                Usuario usuarioA = buscarUsuarioDemo(usuarios, membros.get(i).getEmail());
                Usuario usuarioB = buscarUsuarioDemo(usuarios, membros.get(j).getEmail());
                String tipoChat = tipoPrivado(usuarioA.getEmail(), usuarioB.getEmail());
                for (int k = 0; k < 3; k++) {
                    Usuario remetente = k % 2 == 0 ? usuarioA : usuarioB;
                    chatMensagemRepository.save(ChatMensagem.builder()
                            .autorEmail(remetente.getEmail())
                            .autorNome(remetente.getNome() + " " + remetente.getSobrenome())
                            .tipoChat(tipoChat)
                            .conteudo(mensagemPrivadaProjeto(projeto, i, j, k))
                            .anexo(null)
                            .editada(false)
                            .excluida(false)
                            .dataHora(LocalDateTime.now().minusDays(2).plusMinutes((long) projectIndex * 300 + i * 20L + j * 3L + k))
                            .projeto(null)
                            .build());
                }
                notificacaoRepository.save(Notificacao.builder()
                        .destinatarioEmail(usuarioB.getEmail())
                        .tipo("MENSAGEM_PRIVADA")
                        .referenciaId(null)
                        .projetoId(projeto.getId())
                        .projetoNome(projeto.getNomeProjeto())
                        .equipeNome(projeto.getNomeEquipe())
                        .remetenteEmail(usuarioA.getEmail())
                        .remetenteNome(usuarioA.getNome() + " " + usuarioA.getSobrenome())
                        .mensagem("Nova conversa sobre " + projeto.getNomeProjeto() + ".")
                        .status((i + j) % 2 == 0 ? "LIDA" : "NOVA")
                        .titulo("Mensagem sobre o projeto")
                        .texto(mensagemPrivadaProjeto(projeto, i, j, 0))
                        .dataHora(LocalDateTime.now().minusHours(projectIndex + i + j))
                        .build());
            }
        }
    }

    private Usuario buscarUsuarioDemo(List<Usuario> usuarios, String email) {
        return usuarios.stream()
                .filter(usuario -> usuario.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElse(usuarios.get(0));
    }

    private void criarChatsPrivados(List<Usuario> usuarios) {
        for (int i = 0; i < usuarios.size(); i++) {
            Usuario autor = usuarios.get(i);
            Usuario contato = usuarios.get((i + 7) % usuarios.size());
            String tipoChat = tipoPrivado(autor.getEmail(), contato.getEmail());
            for (int j = 0; j < 4; j++) {
                Usuario remetente = j % 2 == 0 ? autor : contato;
                chatMensagemRepository.save(ChatMensagem.builder()
                        .autorEmail(remetente.getEmail())
                        .autorNome(remetente.getNome() + " " + remetente.getSobrenome())
                        .tipoChat(tipoChat)
                        .conteudo(mensagemPrivada(i, j))
                        .anexo(null)
                        .editada(false)
                        .excluida(false)
                        .dataHora(LocalDateTime.now().minusDays(2).plusMinutes((long) i * 6 + j))
                        .projeto(null)
                        .build());
            }
            notificacaoRepository.save(Notificacao.builder()
                    .destinatarioEmail(contato.getEmail())
                    .tipo("MENSAGEM_PRIVADA")
                    .referenciaId(null)
                    .projetoId(null)
                    .remetenteEmail(autor.getEmail())
                    .remetenteNome(autor.getNome() + " " + autor.getSobrenome())
                    .mensagem("Nova conversa privada com " + autor.getNome() + ".")
                    .status(i % 3 == 0 ? "LIDA" : "NOVA")
                    .titulo("Mensagem privada")
                    .texto(mensagemPrivada(i, 0))
                    .dataHora(LocalDateTime.now().minusHours(1).plusMinutes(i))
                    .build());
        }
    }

    private StatusTarefa statusTarefa(int index) {
        return switch (index % 5) {
            case 0 -> StatusTarefa.PENDENTE;
            case 1 -> StatusTarefa.EM_ANDAMENTO;
            case 2 -> StatusTarefa.EM_VALIDACAO;
            case 3 -> StatusTarefa.AJUSTES;
            default -> StatusTarefa.APROVADA;
        };
    }

    private String nomeTarefa(int index) {
        String[] nomes = {
                "Revisar jornada de solicitacao", "Consolidar regras de permissao", "Ajustar listagem principal",
                "Validar filtros por periodo", "Preparar retorno para coordenacao", "Refinar cadastro inicial",
                "Conferir indicadores de atraso", "Documentar criterios de aceite", "Testar fluxo em celular",
                "Organizar arquivos de referencia", "Revisar mensagens de erro", "Fechar pendencias da sprint"
        };
        return nomes[index % nomes.length] + " #" + (index + 1);
    }

    private String descricaoTarefa(Projeto projeto, int index) {
        String[] descricoes = {
                "Entender onde os alunos abandonam o fluxo e propor ajustes para reduzir retrabalho da secretaria.",
                "Conferir se lideres, membros e convidados estao vendo apenas as acoes permitidas no projeto.",
                "Melhorar a leitura da tela para que a equipe encontre pendencias sem depender de planilhas externas.",
                "Cruzar prazos, responsaveis e situacao atual para apoiar a reuniao semanal de acompanhamento.",
                "Preparar um resumo objetivo com riscos, proximos passos e decisoes que precisam de aprovacao.",
                "Revisar campos obrigatorios, textos de ajuda e estados vazios antes da proxima apresentacao.",
                "Comparar tarefas planejadas com entregas reais e destacar atrasos que afetam o cronograma.",
                "Registrar como a entrega sera validada para evitar interpretacoes diferentes entre os membros.",
                "Conferir se a tela continua legivel em notebook, tablet e celular durante uso em sala.",
                "Separar atas, imagens e referencias usadas pela equipe para facilitar consulta posterior.",
                "Trocar mensagens genericas por orientacoes claras quando a API retornar erro ou dado incompleto.",
                "Fechar pequenos ajustes encontrados pela equipe antes de marcar a coluna como concluida."
        };
        return descricoes[index % descricoes.length] + " Contexto: " + projeto.getNomeProjeto() + ".";
    }

    private String nomeEvento(int index) {
        String[] nomes = {
                "Reuniao com coordenacao", "Checkpoint da sprint", "Entrega para validacao", "Oficina com usuarios",
                "Planejamento tecnico", "Revisao de indicadores", "Banca de avaliacao", "Treinamento da equipe",
                "Homologacao do fluxo", "Apresentacao de resultados"
        };
        return nomes[index % nomes.length];
    }

    private String descricaoEvento(Projeto projeto, int index) {
        String[] descricoes = {
                "Alinhar prioridades, restricoes e combinados antes do fechamento da semana.",
                "Conferir entregas feitas, impedimentos e responsabilidades para o proximo ciclo.",
                "Apresentar a versao atual para receber observacoes da equipe responsavel.",
                "Observar usuarios executando o fluxo e registrar pontos de confusao.",
                "Definir integracoes, dependencias e riscos tecnicos do projeto.",
                "Analisar numeros recentes e decidir quais indicadores entram no painel.",
                "Validar a entrega com professores convidados e registrar ajustes finais.",
                "Capacitar membros para operar o modulo sem acompanhamento direto.",
                "Testar o fluxo completo com dados reais antes de liberar para uso.",
                "Compartilhar avancos, metricas e decisoes tomadas no projeto."
        };
        return descricoes[index % descricoes.length] + " Projeto: " + projeto.getNomeProjeto() + ".";
    }

    private String mensagemChat(Projeto projeto, int index) {
        String[] mensagens = {
                "Revisei o fluxo com a secretaria e eles pediram para simplificar a etapa de confirmacao.",
                "Inclui no quadro as pendencias que apareceram na ultima reuniao. As mais urgentes estao em validacao.",
                "A coordenacao quer ver um resumo por prazo e responsavel na apresentacao de sexta.",
                "Consegui reproduzir o problema no cadastro. Parece ocorrer quando o usuario volta para editar os dados.",
                "Os textos da tela ficaram mais claros depois da revisao. Falta validar com alguem de fora da equipe.",
                "Marquei no calendario a homologacao com dois usuarios. Vou anexar as anotacoes na tarefa depois.",
                "O painel ja mostra a maior parte dos dados, mas alguns indicadores precisam de nomes mais objetivos.",
                "Fechei a integracao com a lista de membros. Agora os responsaveis aparecem corretamente no detalhe.",
                "Acho melhor manter essa entrega pequena e registrar o restante como melhoria para a proxima sprint.",
                "Subi uma nova versao para teste. Podem focar em fluxo mobile e mensagens de erro?",
                "A tarefa de documentacao esta quase pronta. Falta so revisar exemplos e prints.",
                "Recebi retorno positivo do teste guiado, mas ainda precisamos ajustar o estado vazio da tela principal."
        };
        return mensagens[index % mensagens.length] + " (" + projeto.getNomeProjeto() + ")";
    }

    private String mensagemPrivada(int userIndex, int messageIndex) {
        String[] mensagens = {
                "Oi, voce consegue revisar minha tarefa antes da reuniao?",
                "Consigo sim. Vou olhar os criterios de aceite e te retorno ainda hoje.",
                "Perfeito. A principal duvida e sobre o prazo que ficou no calendario.",
                "Vi aqui. Mantem o prazo e coloca uma observacao no comentario da tarefa."
        };
        return mensagens[(userIndex + messageIndex) % mensagens.length];
    }

    private String mensagemPrivadaProjeto(Projeto projeto, int memberIndexA, int memberIndexB, int messageIndex) {
        String[] mensagens = {
                "Voce viu a tarefa de hoje em " + projeto.getNomeProjeto() + "? Acho que precisamos ajustar o criterio de aceite antes de mover.",
                "Vi sim. O ponto principal e confirmar se a coordenacao quer esse detalhe no primeiro fluxo ou so na proxima entrega.",
                "Concordo. Vou comentar na tarefa e deixar a reuniao do calendario como referencia para a decisao.",
                "Boa. Se voce atualizar a descricao, eu reviso o checklist e marco como pronto para validacao.",
                "A tela ficou melhor, mas ainda estou em duvida sobre a mensagem quando nao existe nenhum registro.",
                "Podemos colocar um texto mais direto e testar com alguem que nao participou da implementacao."
        };
        return mensagens[(memberIndexA + memberIndexB + messageIndex) % mensagens.length];
    }

    private String checklistTexto(Projeto projeto, int index) {
        return "Confirmar regra com responsavel\nAtualizar tela de " + projeto.getNomeProjeto()
                + "\nValidar com dois membros da equipe\nRegistrar evidencia da entrega";
    }

    private String comentariosJson(String autorA, String autorB, Projeto projeto, int index) {
        return "["
                + "{\"id\":\"demo-1\",\"autor\":\"" + autorA + "\",\"texto\":\"Conversei com a equipe e registrei os pontos principais para "
                + projeto.getNomeProjeto() + ".\",\"data\":\""
                + LocalDateTime.now().minusDays(2) + "\"},"
                + "{\"id\":\"demo-2\",\"autor\":\"" + autorB + "\",\"texto\":\"Revisei a entrega #" + (index + 1)
                + " e deixei pequenos ajustes de validacao.\",\"data\":\""
                + LocalDateTime.now().minusDays(1) + "\"}"
                + "]";
    }

    private String tipoNotificacao(int index) {
        String[] tipos = {
                "CONVITE_EQUIPE", "TAREFA_ATRIBUIDA", "EVENTO_CRIADO", "COMENTARIO_TAREFA",
                "PRAZO_PROXIMO", "STATUS_PROJETO"
        };
        return tipos[index % tipos.length];
    }

    private String tituloNotificacao(int index) {
        String[] titulos = {
                "Voce entrou em um projeto", "Nova tarefa atribuida", "Evento marcado no calendario",
                "Novo comentario em tarefa", "Prazo se aproxima", "Status do projeto atualizado"
        };
        return titulos[index % titulos.length];
    }

    private String mensagemNotificacao(Projeto projeto, int index) {
        String[] mensagens = {
                "Voce foi incluido na equipe de " + projeto.getNomeProjeto() + ".",
                "Uma tarefa importante foi atribuida a voce em " + projeto.getNomeProjeto() + ".",
                "Ha um novo evento de acompanhamento no calendario do projeto.",
                "Um membro adicionou observacoes em uma tarefa que voce acompanha.",
                "Uma entrega do projeto vence nos proximos dias.",
                "O lider atualizou o andamento geral do projeto."
        };
        return mensagens[index % mensagens.length];
    }

    private String textoNotificacao(Projeto projeto, int index) {
        String[] textos = {
                "Acesse o projeto para conferir membros, tarefas abertas e proximas reunioes.",
                "Revise a descricao da tarefa, checklist e data de entrega antes de iniciar.",
                "Confira data, responsaveis e observacoes do compromisso registrado.",
                "Leia o comentario para entender o ajuste solicitado pela equipe.",
                "Verifique se ainda ha pendencias antes da data combinada.",
                "Consulte o quadro para ver o que mudou desde o ultimo acompanhamento."
        };
        return textos[index % textos.length] + " Projeto: " + projeto.getNomeProjeto() + ".";
    }

    private String tipoPrivado(String emailA, String emailB) {
        boolean emailAPrimeiro = emailA.compareToIgnoreCase(emailB) <= 0;
        return "PRIVADO:"
                + (emailAPrimeiro ? emailA.toLowerCase() : emailB.toLowerCase())
                + ":"
                + (emailAPrimeiro ? emailB.toLowerCase() : emailA.toLowerCase());
    }
}
