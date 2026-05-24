package com.tis.acadus.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.tis.acadus.dto.ProjetoRequestDTO;
import com.tis.acadus.dto.ProjetoResponseDTO;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.entity.enums.StatusProjeto;
import com.tis.acadus.repository.ProjetoRepository;

@Service
public class ProjetoService {

    private final ProjetoRepository repository;

    public ProjetoService(ProjetoRepository repository) {
        this.repository = repository;
    }

    public List<ProjetoResponseDTO> listarProjetos() {
        return repository.findAll()
                .stream()
                .map(this::converterParaDTO)
                .toList();
    }

    public ProjetoResponseDTO buscarProjetoPorId(Long id) {
        Projeto projeto = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projeto não encontrado"));

        return converterParaDTO(projeto);
    }

    public ProjetoResponseDTO criarProjeto(ProjetoRequestDTO dto) {
        Projeto projeto = Projeto.builder()
                .nome(dto.getNome())
                .descricao(dto.getDescricao())
                .dataCriacao(LocalDate.now())
                .status(StatusProjeto.ATIVO)
                .build();

        Projeto salvo = repository.save(projeto);

        return converterParaDTO(salvo);
    }

    public ProjetoResponseDTO editarProjeto(Long id, ProjetoRequestDTO dto) {

        Projeto projeto = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projeto não encontrado"));

        projeto.setNome(dto.getNome());
        projeto.setDescricao(dto.getDescricao());

        return converterParaDTO(repository.save(projeto));
    }

    public void excluirProjeto(Long id) {
        repository.deleteById(id);
    }

    public ProjetoResponseDTO converterParaDTO(Projeto projeto) {

        return ProjetoResponseDTO.builder()
                .id(projeto.getId())
                .nome(projeto.getNome())
                .descricao(projeto.getDescricao())
                .dataCriacao(projeto.getDataCriacao())
                .status(projeto.getStatus())
                .build();
    }
}