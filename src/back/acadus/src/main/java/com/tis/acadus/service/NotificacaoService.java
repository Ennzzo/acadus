package com.tis.acadus.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.tis.acadus.dto.NotificacaoResponseDTO;
import com.tis.acadus.entity.MembroEquipe;
import com.tis.acadus.entity.Notificacao;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.entity.Tarefa;
import com.tis.acadus.entity.Usuario;
import com.tis.acadus.entity.enums.StatusConvite;
import com.tis.acadus.entity.enums.StatusTarefa;
import com.tis.acadus.repository.MembroEquipeRepository;
import com.tis.acadus.repository.NotificacaoRepository;
import com.tis.acadus.repository.UsuarioRepository;

@Service
public class NotificacaoService {
    private final NotificacaoRepository repository;
    private final MembroEquipeRepository membroRepository;
    private final UsuarioRepository usuarioRepository;

    public NotificacaoService(
            NotificacaoRepository repository,
            MembroEquipeRepository membroRepository,
            UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.membroRepository = membroRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<NotificacaoResponseDTO> listar(String email) {
        List<NotificacaoResponseDTO> notificacoes = new ArrayList<>(repository
                .findByDestinatarioEmailIgnoreCaseOrderByDataHoraDescIdDesc(email).stream()
                .map(this::toDto)
                .toList());

        for (MembroEquipe membro : membroRepository.findByEmailOrderByIdDesc(email)) {
            if (foiConvidado(membro) && !repository.existsByTipoAndReferenciaId("CONVITE", membro.getId())) {
                notificacoes.add(conviteAntigo(membro));
            }

            if ((membro.getStatusTransferencia() != null || Boolean.TRUE.equals(membro.getTransferenciaPendente()))
                    && !repository.existsByTipoAndReferenciaId("LIDERANCA", membro.getId())) {
                notificacoes.add(liderancaAntiga(membro));
            }
        }

        return notificacoes.stream()
                .sorted(Comparator.comparing(NotificacaoResponseDTO::getDataHora).reversed())
                .toList();
    }

    public void criarConvite(MembroEquipe membro) {
        String remetente = membro.getConvidadoPor() != null
                ? membro.getConvidadoPor()
                : membro.getProjeto().getLiderEmail();
        salvar(membro.getEmail(), "CONVITE", membro.getId(), membro.getProjeto(), remetente,
                membro.getMensagem(), StatusConvite.PENDENTE.name(), "Convite para equipe",
                textoConvite(StatusConvite.PENDENTE));
    }

    public void atualizarConvite(MembroEquipe membro) {
        atualizar("CONVITE", membro.getId(), membro.getStatus().name(), textoConvite(membro.getStatus()));
    }

    public void cancelarConvite(MembroEquipe membro, String mensagem) {
        repository.findFirstByTipoAndReferenciaIdOrderByIdDesc("CONVITE", membro.getId()).ifPresent(notificacao -> {
            notificacao.setStatus(StatusConvite.CANCELADO.name());
            notificacao.setTexto(textoConvite(StatusConvite.CANCELADO));
            notificacao.setMensagem(mensagem);
            repository.save(notificacao);
        });
    }

    public void criarConviteRecusado(MembroEquipe membro) {
        String lider = membro.getProjeto().getLiderEmail();
        if (membro.getStatus() == StatusConvite.RECUSADO
                && lider != null
                && !lider.equalsIgnoreCase(membro.getEmail())) {
            salvar(lider, "CONVITE_RECUSADO", membro.getId(), membro.getProjeto(), membro.getEmail(),
                    null, StatusConvite.RECUSADO.name(), "Convite recusado",
                    nomeDoEmail(membro.getEmail()) + " recusou o convite para participar da equipe.");
        }
    }

    public void criarTransferencia(MembroEquipe membro, String remetente) {
        salvar(membro.getEmail(), "LIDERANCA", membro.getId(), membro.getProjeto(), remetente,
                null, StatusConvite.PENDENTE.name(), "Transferência de liderança",
                "Você recebeu uma solicitação para liderar este projeto.");
    }

    public void atualizarTransferencia(MembroEquipe membro) {
        StatusConvite status = membro.getStatusTransferencia();
        String texto = status == StatusConvite.ACEITO
                ? "Você aceitou a transferência de liderança."
                : "Você recusou a transferência de liderança.";
        atualizar("LIDERANCA", membro.getId(), status.name(), texto);
    }

    public void criarRemocao(MembroEquipe membro, String remetente, String mensagem) {
        salvar(membro.getEmail(), "REMOCAO_EQUIPE", membro.getId(), membro.getProjeto(), remetente,
                mensagem, null, "Remoção da equipe", "Você foi removido desta equipe.");
    }

    public void criarSaida(MembroEquipe membro) {
        String lider = membro.getProjeto().getLiderEmail();
        if (lider != null && !lider.equalsIgnoreCase(membro.getEmail())) {
            salvar(lider, "SAIDA_EQUIPE", membro.getId(), membro.getProjeto(), membro.getEmail(),
                    null, null, "Saída da equipe", nomeDoEmail(membro.getEmail()) + " saiu da equipe.");
        }
    }

    public void criarMensagemPrivada(Usuario autor, String destinatario) {
        salvar(destinatario, "MENSAGEM_PRIVADA", null, null, autor.getEmail(),
                null, null, "Nova mensagem privada", nome(autor) + " enviou uma mensagem.");
    }

    public void criarTarefaAtribuida(Tarefa tarefa, String destinatario) {
        salvar(destinatario, "TAREFA", tarefa.getId(), tarefa.getProjeto(), null,
                null, null, "Tarefa atribuída", tarefa.getNome());
    }

    public void criarValidacao(Tarefa tarefa) {
        String lider = tarefa.getProjeto().getLiderEmail();
        if (lider != null) {
            salvar(lider, "TAREFA", tarefa.getId(), tarefa.getProjeto(), null,
                    null, null, "Tarefa em validação", tarefa.getNome());
        }
    }

    public void criarAtualizacaoTarefa(Tarefa tarefa) {
        if (tarefa.getStatus() != StatusTarefa.APROVADA && tarefa.getStatus() != StatusTarefa.AJUSTES) {
            return;
        }

        for (String email : emails(tarefa.getResponsavel())) {
            String titulo = tarefa.getStatus() == StatusTarefa.APROVADA ? "Tarefa aprovada" : "Ajustes solicitados";
            salvar(email, "TAREFA", tarefa.getId(), tarefa.getProjeto(), null,
                    null, null, titulo, tarefa.getNome());
        }
    }

    private void atualizar(String tipo, Long referenciaId, String status, String texto) {
        repository.findFirstByTipoAndReferenciaIdOrderByIdDesc(tipo, referenciaId).ifPresent(notificacao -> {
            notificacao.setStatus(status);
            notificacao.setTexto(texto);
            repository.save(notificacao);
        });
    }

    private void salvar(
            String destinatario,
            String tipo,
            Long referenciaId,
            Projeto projeto,
            String remetenteEmail,
            String mensagem,
            String status,
            String titulo,
            String texto) {
        Usuario remetente = remetenteEmail != null
                ? usuarioRepository.findByEmailIgnoreCase(remetenteEmail).orElse(null)
                : null;
        repository.save(Notificacao.builder()
                .destinatarioEmail(destinatario)
                .tipo(tipo)
                .referenciaId(referenciaId)
                .projetoId(projeto != null ? projeto.getId() : null)
                .projetoNome(projeto != null ? projeto.getNomeProjeto() : null)
                .equipeNome(projeto != null ? projeto.getNomeEquipe() : null)
                .remetenteEmail(remetenteEmail)
                .remetenteNome(nome(remetente))
                .mensagem(mensagem)
                .status(status)
                .titulo(titulo)
                .texto(texto)
                .dataHora(LocalDateTime.now())
                .build());
    }

    private NotificacaoResponseDTO conviteAntigo(MembroEquipe membro) {
        String remetente = membro.getConvidadoPor() != null
                ? membro.getConvidadoPor()
                : membro.getProjeto().getLiderEmail();
        Usuario usuario = remetente != null
                ? usuarioRepository.findByEmailIgnoreCase(remetente).orElse(null)
                : null;
        return NotificacaoResponseDTO.builder()
                .tipo("CONVITE")
                .referenciaId(membro.getId())
                .projetoId(membro.getProjeto().getId())
                .projetoNome(membro.getProjeto().getNomeProjeto())
                .equipeNome(membro.getProjeto().getNomeEquipe())
                .remetenteEmail(remetente)
                .remetenteNome(nome(usuario))
                .dataHora(membro.getDataConvite().atStartOfDay())
                .mensagem(membro.getMensagem())
                .status(membro.getStatus().name())
                .titulo("Convite para equipe")
                .texto(textoConvite(membro.getStatus()))
                .build();
    }

    private NotificacaoResponseDTO liderancaAntiga(MembroEquipe membro) {
        StatusConvite status = membro.getStatusTransferencia() != null
                ? membro.getStatusTransferencia()
                : StatusConvite.PENDENTE;
        return NotificacaoResponseDTO.builder()
                .tipo("LIDERANCA")
                .referenciaId(membro.getId())
                .projetoId(membro.getProjeto().getId())
                .projetoNome(membro.getProjeto().getNomeProjeto())
                .equipeNome(membro.getProjeto().getNomeEquipe())
                .dataHora(membro.getDataEntrada() != null ? membro.getDataEntrada() : membro.getDataConvite().atStartOfDay())
                .status(status.name())
                .titulo("Transferência de liderança")
                .texto("Você recebeu uma solicitação para liderar este projeto.")
                .build();
    }

    private NotificacaoResponseDTO toDto(Notificacao notificacao) {
        return NotificacaoResponseDTO.builder()
                .tipo(notificacao.getTipo())
                .referenciaId(notificacao.getReferenciaId())
                .projetoId(notificacao.getProjetoId())
                .projetoNome(notificacao.getProjetoNome())
                .equipeNome(notificacao.getEquipeNome())
                .remetenteEmail(notificacao.getRemetenteEmail())
                .remetenteNome(notificacao.getRemetenteNome())
                .dataHora(notificacao.getDataHora())
                .mensagem(notificacao.getMensagem())
                .status(notificacao.getStatus())
                .titulo(notificacao.getTitulo())
                .texto(notificacao.getTexto())
                .build();
    }

    private boolean foiConvidado(MembroEquipe membro) {
        if (membro.getConvidadoPor() != null) return true;
        return membroRepository.findByProjetoIdOrderByIdAsc(membro.getProjeto().getId()).stream()
                .findFirst()
                .map(primeiro -> !primeiro.getId().equals(membro.getId()))
                .orElse(false);
    }

    private String textoConvite(StatusConvite status) {
        return switch (status) {
            case ACEITO -> "Você aceitou este convite.";
            case RECUSADO -> "Você recusou este convite.";
            case CANCELADO -> "Este convite foi cancelado pelo líder.";
            default -> "Você recebeu um convite para participar desta equipe.";
        };
    }

    private List<String> emails(String responsavel) {
        if (responsavel == null || responsavel.isBlank()) return List.of();
        return List.of(responsavel.split(",")).stream()
                .map(String::trim)
                .filter(email -> !email.isBlank())
                .distinct()
                .toList();
    }

    private String nomeDoEmail(String email) {
        return usuarioRepository.findByEmailIgnoreCase(email)
                .map(this::nome)
                .orElse(email);
    }

    private String nome(Usuario usuario) {
        if (usuario == null) return null;
        return (usuario.getNome() + " " + usuario.getSobrenome()).trim();
    }
}
