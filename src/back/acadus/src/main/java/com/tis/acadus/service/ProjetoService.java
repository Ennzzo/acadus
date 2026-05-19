package com.tis.acadus.service;

import java.time.LocalDate;
import java.util.List;

import com.tis.acadus.dto.ProjetoRequestDTO;
import com.tis.acadus.dto.ProjetoResponseDTO;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.entity.enums.StatusProjeto;
import com.tis.acadus.repository.ProjetoRepository;

public class ProjetoService {
    private final ProjetoRepository repository;

    public ProjetoService(ProjetoRepository repository) {
        this.repository = repository;
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

    public void excluirProjeto(Long id) {

        Projeto projeto = buscarProjetoPorId(id);

        repository.delete(projeto);
    }

    public ProjetoResponseDTO converterParaDTO(Projeto projeto) {

        return ProjetoResponseDTO.builder()
                .id(projeto.getId())
                .nomeProjeto(projeto.getNomeProjeto())
                .descricao(projeto.getDescricao())
                .dataCriacao(projeto.getDataCriacao())
                .status(projeto.getStatus())
                .build();
    }

}
