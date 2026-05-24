package com.tis.acadus.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.tis.acadus.dto.ProjetoRequestDTO;
import com.tis.acadus.dto.ProjetoResponseDTO;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.entity.enums.StatusProjeto;
import com.tis.acadus.repository.ProjetoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjetoService {
    private final ProjetoRepository projetoRepository;

    public List<ProjetoResponseDTO> listarProjetos() {
        return projetoRepository.findAll()
                .stream()
                .map(this::converterParaDTO)
                .toList();
    }

    public ProjetoResponseDTO buscarProjetoPorId(Long id) {
        Projeto projeto = projetoRepository.findById(id)
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

        Projeto salvo = projetoRepository.save(projeto);

        return converterParaDTO(salvo);
    }

    public ProjetoResponseDTO editarProjeto(Long id, ProjetoRequestDTO dto) {

        Projeto projeto = projetoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projeto não encontrado"));

        projeto.setNome(dto.getNome());
        projeto.setDescricao(dto.getDescricao());

        return converterParaDTO(projetoRepository.save(projeto));
    }

    public void excluirProjeto(Long id) {
        Projeto projeto = projetoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projeto não encontrado"));

        projetoRepository.delete(projeto);
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