package com.tis.acadus.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tis.acadus.dto.MembroEquipeResponseDTO;
import com.tis.acadus.dto.ProjetoComStatusDTO;
import com.tis.acadus.dto.ProjetoRequestDTO;
import com.tis.acadus.dto.ProjetoResponseDTO;
import com.tis.acadus.entity.MembroEquipe;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.entity.Usuario;
import com.tis.acadus.entity.enums.PapelMembro;
import com.tis.acadus.entity.enums.StatusConvite;
import com.tis.acadus.entity.enums.StatusProjeto;
import com.tis.acadus.repository.ChatMensagemRepository;
import com.tis.acadus.repository.MembroEquipeRepository;
import com.tis.acadus.repository.ProjetoRepository;
import com.tis.acadus.repository.QuadroColunaRepository;
import com.tis.acadus.repository.TarefaRepository;
import com.tis.acadus.repository.UsuarioRepository;

@Service
public class ProjetoService {
    private final ProjetoRepository repository;
    private final TarefaRepository tarefaRepository;
    private final MembroEquipeRepository membroRepository;
    private final ChatMensagemRepository chatRepository;
    private final QuadroColunaRepository colunaRepository;
    private final UsuarioRepository usuarioRepository;

    public ProjetoService(
            ProjetoRepository repository,
            TarefaRepository tarefaRepository,
            MembroEquipeRepository membroRepository,
            ChatMensagemRepository chatRepository,
            QuadroColunaRepository colunaRepository,
            UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.tarefaRepository = tarefaRepository;
        this.membroRepository = membroRepository;
        this.chatRepository = chatRepository;
        this.colunaRepository = colunaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Projeto> listarProjetos(String email) {
        if (email == null || email.isBlank()) {
            return List.of();
        }

        return membroRepository.findProjetosByEmailAndStatus(email, StatusConvite.ACEITO).stream()
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .toList();
    }

    public Projeto buscarProjetoPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Projeto não encontrado."));
    }

    public Projeto buscarProjetoDoUsuario(Long id, String email) {
        if (email == null || email.isBlank()
                || !membroRepository.existsByProjetoIdAndEmailIgnoreCaseAndStatusAndDataSaidaIsNull(
                        id, email, StatusConvite.ACEITO)) {
            throw new RuntimeException("Projeto não encontrado.");
        }

        return buscarProjetoPorId(id);
    }

    public Projeto criarProjeto(ProjetoRequestDTO dto) {

        Projeto projeto = Projeto.builder()
                .nomeProjeto(dto.getNomeProjeto())
                .descricao(dto.getDescricao())
                .dataCriacao(LocalDate.now())
                .nomeEquipe("Equipe " + dto.getNomeProjeto())
                .liderEmail(dto.getLiderEmail())
                .capaUrl(dto.getCapaUrl())
                .status(StatusProjeto.ATIVO)
                .build();

        Projeto salvo = repository.save(projeto);

        if (dto.getLiderEmail() != null && !dto.getLiderEmail().isBlank()) {
            membroRepository.save(MembroEquipe.builder()
                    .projeto(salvo)
                    .email(dto.getLiderEmail())
                    .papel(PapelMembro.LIDER)
                    .status(StatusConvite.ACEITO)
                    .transferenciaPendente(false)
                    .bloqueado(false)
                    .dataConvite(LocalDate.now())
                    .dataEntrada(LocalDateTime.now())
                    .build());
        }

        return salvo;
    }

    public Projeto editarProjeto(Long id, ProjetoRequestDTO dto, String email) {
        Projeto projeto = buscarProjetoPorId(id);
        conferirLider(projeto, email);

        projeto.setNomeProjeto(dto.getNomeProjeto());
        projeto.setDescricao(dto.getDescricao());
        projeto.setCapaUrl(dto.getCapaUrl());
        if (dto.getStatus() != null) {
            projeto.setStatus(dto.getStatus());
        }

        return repository.save(projeto);
    }

    @Transactional
    public void excluirProjeto(Long id, String email) {
        Projeto projeto = buscarProjetoPorId(id);
        conferirLider(projeto, email);

        tarefaRepository.deleteByProjetoId(id);
        colunaRepository.deleteByProjetoId(id);
        chatRepository.deleteByProjetoId(id);
        membroRepository.deleteByProjetoId(id);
        repository.delete(projeto);
    }

    public void conferirLider(Projeto projeto, String email) {
        if (email == null || projeto.getLiderEmail() == null
                || !projeto.getLiderEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Somente o líder pode realizar esta ação.");
        }
    }

    public ProjetoResponseDTO toDto(Projeto projeto) {

        return ProjetoResponseDTO.builder()
                .id(projeto.getId())
                .nomeProjeto(projeto.getNomeProjeto())
                .descricao(projeto.getDescricao())
                .dataCriacao(projeto.getDataCriacao())
                .nomeEquipe(projeto.getNomeEquipe())
                .liderEmail(projeto.getLiderEmail())
                .capaUrl(projeto.getCapaUrl())
                .status(projeto.getStatus())
                .build();
    }

    public List<ProjetoComStatusDTO> listarProjetosDoUsuario(String email) {
        if (email == null || email.isBlank()) {
            return List.of();
        }

        return membroRepository.findByEmailIgnoreCaseAndStatus(email, StatusConvite.ACEITO).stream()
                .map(membro -> {
                    Projeto projeto = membro.getProjeto();
                    String statusUsuario = projeto.getLiderEmail() != null && projeto.getLiderEmail().equalsIgnoreCase(email)
                            ? "CRIADOR"
                            : "CONVIDADO";

                    return new ProjetoComStatusDTO(
                            projeto.getId(),
                            projeto.getNomeProjeto(),
                            projeto.getDescricao(),
                            projeto.getDataCriacao(),
                            projeto.getNomeEquipe(),
                            projeto.getLiderEmail(),
                            projeto.getCapaUrl(),
                            projeto.getStatus(),
                            statusUsuario);
                })
                .sorted((a, b) -> b.id().compareTo(a.id()))
                .toList();
    }

    public List<MembroEquipeResponseDTO> listarMembrosDoProjetoAceitos(Long projetoId) {
        if (projetoId == null || projetoId <= 0) {
            return List.of();
        }

        return membroRepository.findByProjetoIdOrderByIdAsc(projetoId).stream()
                .filter(membro -> membro.getStatus() == StatusConvite.ACEITO)
                .map(membro -> {
                    Optional<Usuario> usuario = usuarioRepository.findByEmailIgnoreCase(membro.getEmail());

                    return MembroEquipeResponseDTO.builder()
                            .id(membro.getId())
                            .projetoId(projetoId)
                            .email(membro.getEmail())
                            .nome(usuario.map(Usuario::getNome).orElse(null))
                            .sobrenome(usuario.map(Usuario::getSobrenome).orElse(null))
                            .fotoUrl(usuario.map(Usuario::getFotoUrl).orElse(null))
                            .papel(membro.getPapel())
                            .mensagem(membro.getMensagem())
                            .convidadoPor(membro.getConvidadoPor())
                            .transferenciaPendente(membro.getTransferenciaPendente())
                            .statusTransferencia(membro.getStatusTransferencia())
                            .bloqueado(membro.getBloqueado())
                            .motivoBloqueio(membro.getMotivoBloqueio())
                            .status(membro.getStatus())
                            .dataConvite(membro.getDataConvite())
                            .dataEntrada(membro.getDataEntrada())
                            .dataSaida(membro.getDataSaida())
                            .removido(membro.getRemovido())
                            .ocultoLista(membro.getOcultoLista())
                            .build();
                })
                .toList();
    }
}
