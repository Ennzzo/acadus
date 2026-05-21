package com.tis.acadus.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tis.acadus.dto.ProjetoRequestDTO;
import com.tis.acadus.dto.ProjetoResponseDTO;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.entity.enums.StatusProjeto;
import com.tis.acadus.repository.MembroEquipeRepository;
import com.tis.acadus.repository.ProjetoRepository;
import com.tis.acadus.repository.TarefaRepository;

@Service
public class ProjetoService {
    private final ProjetoRepository repository;
    private final TarefaRepository tarefaRepository;
    private final MembroEquipeRepository membroRepository;

    public ProjetoService(
            ProjetoRepository repository,
            TarefaRepository tarefaRepository,
            MembroEquipeRepository membroRepository) {
        this.repository = repository;
        this.tarefaRepository = tarefaRepository;
        this.membroRepository = membroRepository;
    }

    public List<Projeto> listarProjetos() {
        return repository.findAll();
    }

    public Projeto buscarProjetoPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Projeto não encontrado."));
    }

    public Projeto criarProjeto(ProjetoRequestDTO dto) {

        Projeto projeto = Projeto.builder()
                .nomeProjeto(dto.getNomeProjeto())
                .descricao(dto.getDescricao())
                .dataCriacao(LocalDate.now())
                .nomeEquipe("Equipe " + dto.getNomeProjeto())
                .status(StatusProjeto.ATIVO)
                .build();

        return repository.save(projeto);
    }

    public Projeto editarProjeto(Long id, ProjetoRequestDTO dto) {

        Projeto projeto = buscarProjetoPorId(id);

        projeto.setNomeProjeto(dto.getNomeProjeto());
        projeto.setDescricao(dto.getDescricao());

        return repository.save(projeto);
    }

    @Transactional
    public void excluirProjeto(Long id) {

        Projeto projeto = buscarProjetoPorId(id);

        tarefaRepository.deleteByProjetoId(id);
        membroRepository.deleteByProjetoId(id);
        repository.delete(projeto);
    }

    public ProjetoResponseDTO toDto(Projeto projeto) {

        return ProjetoResponseDTO.builder()
                .id(projeto.getId())
                .nomeProjeto(projeto.getNomeProjeto())
                .descricao(projeto.getDescricao())
                .dataCriacao(projeto.getDataCriacao())
                .nomeEquipe(projeto.getNomeEquipe())
                .status(projeto.getStatus())
                .build();
    }
}
