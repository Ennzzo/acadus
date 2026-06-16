package com.tis.acadus.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tis.acadus.dto.ProjetoRequestDTO;
import com.tis.acadus.dto.ProjetoResponseDTO;
import com.tis.acadus.entity.MembroEquipe;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.entity.enums.PapelMembro;
import com.tis.acadus.entity.enums.StatusConvite;
import com.tis.acadus.entity.enums.StatusProjeto;
import com.tis.acadus.repository.ChatMensagemRepository;
import com.tis.acadus.repository.MembroEquipeRepository;
import com.tis.acadus.repository.ProjetoRepository;
import com.tis.acadus.repository.QuadroColunaRepository;
import com.tis.acadus.repository.TarefaRepository;

@Service
public class ProjetoService {
    private final ProjetoRepository repository;
    private final TarefaRepository tarefaRepository;
    private final MembroEquipeRepository membroRepository;
    private final ChatMensagemRepository chatRepository;
    private final QuadroColunaRepository colunaRepository;

    public ProjetoService(
            ProjetoRepository repository,
            TarefaRepository tarefaRepository,
            MembroEquipeRepository membroRepository,
            ChatMensagemRepository chatRepository,
            QuadroColunaRepository colunaRepository) {
        this.repository = repository;
        this.tarefaRepository = tarefaRepository;
        this.membroRepository = membroRepository;
        this.chatRepository = chatRepository;
        this.colunaRepository = colunaRepository;
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
                .nome(dto.getNomeProjeto())
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

        projeto.setNome(dto.getNomeProjeto());
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
}
