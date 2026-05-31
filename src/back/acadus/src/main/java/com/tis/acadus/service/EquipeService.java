package com.tis.acadus.service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tis.acadus.dto.EquipeRequestDTO;
import com.tis.acadus.dto.EquipeResponseDTO;
import com.tis.acadus.dto.BloqueioMembroRequestDTO;
import com.tis.acadus.dto.MembroEquipeRequestDTO;
import com.tis.acadus.dto.MembroEquipeResponseDTO;
import com.tis.acadus.dto.MembroStatusRequestDTO;
import com.tis.acadus.dto.RemocaoMembroRequestDTO;
import com.tis.acadus.entity.MembroEquipe;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.entity.Usuario;
import com.tis.acadus.entity.enums.PapelMembro;
import com.tis.acadus.entity.enums.StatusConvite;
import com.tis.acadus.repository.MembroEquipeRepository;
import com.tis.acadus.repository.ProjetoRepository;
import com.tis.acadus.repository.UsuarioRepository;

@Service
public class EquipeService {
    private final ProjetoService projetoService;
    private final ProjetoRepository projetoRepository;
    private final MembroEquipeRepository membroRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacaoService notificacaoService;

    public EquipeService(
            ProjetoService projetoService,
            ProjetoRepository projetoRepository,
            MembroEquipeRepository membroRepository,
            UsuarioRepository usuarioRepository,
            NotificacaoService notificacaoService) {
        this.projetoService = projetoService;
        this.projetoRepository = projetoRepository;
        this.membroRepository = membroRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificacaoService = notificacaoService;
    }

    public EquipeResponseDTO buscar(Long projetoId) {
        Projeto projeto = projetoService.buscarProjetoPorId(projetoId);
        return toDto(projeto);
    }

    public EquipeResponseDTO salvarNome(Long projetoId, EquipeRequestDTO dto, String email) {
        Projeto projeto = projetoService.buscarProjetoPorId(projetoId);
        projetoService.conferirLider(projeto, email);
        projeto.setNomeEquipe(dto.getNomeEquipe());
        projetoRepository.save(projeto);
        return toDto(projeto);
    }

    public MembroEquipeResponseDTO convidar(Long projetoId, MembroEquipeRequestDTO dto, String email) {
        Projeto projeto = projetoService.buscarProjetoPorId(projetoId);
        projetoService.conferirLider(projeto, email);
        boolean jaConvidado = membroRepository.findByProjetoIdOrderByIdAsc(projetoId).stream()
                .anyMatch(membro -> membro.getEmail().equalsIgnoreCase(dto.getEmail())
                        && (membro.getStatus() == StatusConvite.PENDENTE
                                || membro.getStatus() == StatusConvite.ACEITO && membro.getDataSaida() == null));

        if (jaConvidado) {
            throw new RuntimeException("Este usuário já faz parte da equipe ou possui um convite pendente.");
        }

        MembroEquipe membro = MembroEquipe.builder()
                .projeto(projeto)
                .email(dto.getEmail())
                .papel(PapelMembro.MEMBRO)
                .mensagem(dto.getMensagem())
                .convidadoPor(email)
                .status(StatusConvite.PENDENTE)
                .transferenciaPendente(false)
                .bloqueado(false)
                .removido(false)
                .ocultoLista(false)
                .dataConvite(LocalDate.now())
                .build();

        MembroEquipe salvo = membroRepository.save(membro);
        notificacaoService.criarConvite(salvo);
        return toDto(salvo);
    }

    public MembroEquipeResponseDTO alterarStatus(Long membroId, MembroStatusRequestDTO dto, String email) {
        MembroEquipe membro = buscarMembro(membroId);
        conferirUsuario(membro, email);
        if (membro.getStatus() == StatusConvite.CANCELADO) {
            throw new RuntimeException("Este convite já foi cancelado.");
        }
        if (membro.getStatus() != StatusConvite.PENDENTE
                || (dto.getStatus() != StatusConvite.ACEITO && dto.getStatus() != StatusConvite.RECUSADO)) {
            throw new RuntimeException("Este convite não pode mais ser alterado.");
        }
        membro.setStatus(dto.getStatus());
        if (dto.getStatus() == StatusConvite.ACEITO) {
            membro.setDataEntrada(LocalDateTime.now());
            membro.setDataSaida(null);
        }
        MembroEquipe salvo = membroRepository.save(membro);
        notificacaoService.atualizarConvite(salvo);
        notificacaoService.criarConviteRecusado(salvo);
        return toDto(salvo);
    }

    public MembroEquipeResponseDTO pedirLideranca(Long membroId, String email) {
        MembroEquipe membro = buscarMembro(membroId);
        projetoService.conferirLider(membro.getProjeto(), email);
        if (membro.getStatus() != StatusConvite.ACEITO || membro.getDataSaida() != null) {
            throw new RuntimeException("O membro precisa aceitar o convite antes da transferência.");
        }
        membro.setTransferenciaPendente(true);
        membro.setStatusTransferencia(StatusConvite.PENDENTE);
        MembroEquipe salvo = membroRepository.save(membro);
        notificacaoService.criarTransferencia(salvo, email);
        return toDto(salvo);
    }

    @Transactional
    public MembroEquipeResponseDTO aceitarLideranca(Long membroId, String email) {
        MembroEquipe novoLider = buscarMembro(membroId);
        conferirUsuario(novoLider, email);
        if (!Boolean.TRUE.equals(novoLider.getTransferenciaPendente())
                || novoLider.getStatus() != StatusConvite.ACEITO
                || novoLider.getDataSaida() != null) {
            throw new RuntimeException("Não há uma transferência de liderança pendente.");
        }
        Projeto projeto = novoLider.getProjeto();

        membroRepository.findFirstByProjetoIdAndPapelAndStatus(
                projeto.getId(), PapelMembro.LIDER, StatusConvite.ACEITO)
                .ifPresent(liderAtual -> {
                    liderAtual.setPapel(PapelMembro.MEMBRO);
                    membroRepository.save(liderAtual);
                });

        novoLider.setPapel(PapelMembro.LIDER);
        novoLider.setTransferenciaPendente(false);
        novoLider.setStatusTransferencia(StatusConvite.ACEITO);
        projeto.setLiderEmail(novoLider.getEmail());
        projetoRepository.save(projeto);

        MembroEquipe salvo = membroRepository.save(novoLider);
        notificacaoService.atualizarTransferencia(salvo);
        return toDto(salvo);
    }

    public MembroEquipeResponseDTO recusarLideranca(Long membroId, String email) {
        MembroEquipe membro = buscarMembro(membroId);
        conferirUsuario(membro, email);
        membro.setTransferenciaPendente(false);
        membro.setStatusTransferencia(StatusConvite.RECUSADO);
        MembroEquipe salvo = membroRepository.save(membro);
        notificacaoService.atualizarTransferencia(salvo);
        return toDto(salvo);
    }

    public MembroEquipeResponseDTO bloquear(Long membroId, BloqueioMembroRequestDTO dto, String email) {
        MembroEquipe membro = buscarMembro(membroId);
        projetoService.conferirLider(membro.getProjeto(), email);
        membro.setBloqueado(Boolean.TRUE.equals(dto.getBloqueado()));
        membro.setMotivoBloqueio(Boolean.TRUE.equals(dto.getBloqueado()) ? dto.getMotivo() : null);
        return toDto(membroRepository.save(membro));
    }

    public void removerMembro(Long membroId, String email, RemocaoMembroRequestDTO dto) {
        MembroEquipe membro = buscarMembro(membroId);
        projetoService.conferirLider(membro.getProjeto(), email);

        if (membro.getStatus() == StatusConvite.PENDENTE) {
            String mensagem = dto != null ? dto.getMensagem() : null;
            membro.setStatus(StatusConvite.CANCELADO);
            membro.setMensagem(mensagem);
            membroRepository.save(membro);
            notificacaoService.cancelarConvite(membro, mensagem);
            return;
        }

        sair(membro);
        membro.setRemovido(true);
        membroRepository.save(membro);
        notificacaoService.criarRemocao(membro, email, dto != null ? dto.getMensagem() : null);
    }

    public void ocultarDaLista(Long membroId, String email) {
        MembroEquipe membro = buscarMembro(membroId);
        projetoService.conferirLider(membro.getProjeto(), email);
        if (membro.getStatus() == StatusConvite.ACEITO && membro.getDataSaida() == null) {
            throw new RuntimeException("Remova o membro da equipe antes de ocultá-lo da lista.");
        }
        membro.setOcultoLista(true);
        membroRepository.save(membro);
    }

    public void sair(Long projetoId, String email) {
        MembroEquipe membro = membroRepository.findFirstByProjetoIdAndEmailIgnoreCaseOrderByIdDesc(projetoId, email)
                .orElseThrow(() -> new RuntimeException("Você não faz parte deste projeto."));
        sair(membro);
        notificacaoService.criarSaida(membro);
    }

    private void sair(MembroEquipe membro) {
        if (membro.getPapel() == PapelMembro.LIDER) {
            throw new RuntimeException("Transfira a liderança antes de sair do projeto.");
        }

        if (membro.getStatus() != StatusConvite.ACEITO || membro.getDataSaida() != null) {
            throw new RuntimeException("Este membro não faz parte da equipe.");
        }

        membro.setDataSaida(LocalDateTime.now());
        membro.setTransferenciaPendente(false);
        membroRepository.save(membro);
    }

    private MembroEquipe buscarMembro(Long membroId) {
        return membroRepository.findById(membroId)
                .orElseThrow(() -> new RuntimeException("Membro não encontrado."));
    }

    private void conferirUsuario(MembroEquipe membro, String email) {
        if (email == null || !membro.getEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Você não pode realizar esta ação.");
        }
    }

    private EquipeResponseDTO toDto(Projeto projeto) {
        return EquipeResponseDTO.builder()
                .projetoId(projeto.getId())
                .nomeProjeto(projeto.getNomeProjeto())
                .nomeEquipe(projeto.getNomeEquipe())
                .liderEmail(projeto.getLiderEmail())
                .membros(membroRepository.findByProjetoIdOrderByIdAsc(projeto.getId()).stream()
                        .map(this::toDto)
                        .toList())
                .build();
    }

    private MembroEquipeResponseDTO toDto(MembroEquipe membro) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(membro.getEmail()).orElse(null);

        return MembroEquipeResponseDTO.builder()
                .id(membro.getId())
                .projetoId(membro.getProjeto().getId())
                .email(membro.getEmail())
                .nome(usuario != null ? usuario.getNome() : null)
                .sobrenome(usuario != null ? usuario.getSobrenome() : null)
                .fotoUrl(usuario != null ? usuario.getFotoUrl() : null)
                .papel(membro.getPapel())
                .mensagem(membro.getMensagem())
                .convidadoPor(membro.getConvidadoPor())
                .transferenciaPendente(Boolean.TRUE.equals(membro.getTransferenciaPendente()))
                .statusTransferencia(membro.getStatusTransferencia())
                .bloqueado(Boolean.TRUE.equals(membro.getBloqueado()))
                .motivoBloqueio(membro.getMotivoBloqueio())
                .status(membro.getStatus())
                .dataConvite(membro.getDataConvite())
                .dataEntrada(membro.getDataEntrada() != null
                        ? membro.getDataEntrada()
                        : membro.getStatus() == StatusConvite.ACEITO ? membro.getDataConvite().atStartOfDay() : null)
                .dataSaida(membro.getDataSaida())
                .removido(Boolean.TRUE.equals(membro.getRemovido()))
                .ocultoLista(Boolean.TRUE.equals(membro.getOcultoLista()))
                .build();
    }
}
