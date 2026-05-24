package com.tis.acadus.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tis.acadus.dto.EquipeRequestDTO;
import com.tis.acadus.dto.EquipeResponseDTO;
import com.tis.acadus.entity.Equipe;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.repository.EquipeRepository;
import com.tis.acadus.repository.ProjetoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EquipeService {
    private final EquipeRepository equipeRepository;
    private final ProjetoRepository projetoRepository;

    public List<EquipeResponseDTO> listarEquipes() {
        return equipeRepository.findAll()
                .stream()
                .map(this::converterParaDTO)
                .toList();
    }

    public EquipeResponseDTO buscarEquipePorId(Long id) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipe não encontrada"));

        return converterParaDTO(equipe);
    }

    public EquipeResponseDTO criarEquipe(EquipeRequestDTO dto) {
        Projeto projeto = projetoRepository.findById(dto.getIdProjeto())
                .orElseThrow(() -> new RuntimeException("Projeto não encontrado"));

        Equipe equipe = Equipe.builder()
                .nome(dto.getNome())
                .projeto(projeto)
                .build();

        Equipe salva = equipeRepository.save(equipe);

        return converterParaDTO(salva);
    }

    public EquipeResponseDTO editarEquipe(Long id, EquipeRequestDTO dto) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipe não encontrada"));

        Projeto projeto = projetoRepository.findById(dto.getIdProjeto())
                .orElseThrow(() -> new RuntimeException("Projeto não encontrado"));

        equipe.setNome(dto.getNome());
        equipe.setProjeto(projeto);

        Equipe atualizada = equipeRepository.save(equipe);

        return converterParaDTO(atualizada);
    }

    public void excluirEquipe(Long id) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipe não encontrada"));

        equipeRepository.delete(equipe);
    }

    public EquipeResponseDTO converterParaDTO(Equipe equipe) {
        return EquipeResponseDTO.builder()
                .id(equipe.getId())
                .nome(equipe.getNome())
                .idProjeto(equipe.getProjeto().getId())
                .nomeProjeto(equipe.getProjeto().getNome())
                .build();
    }
}
