package com.tis.acadus.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tis.acadus.dto.EquipeRequestDTO;
import com.tis.acadus.dto.EquipeResponseDTO;
import com.tis.acadus.dto.MembroEquipeRequestDTO;
import com.tis.acadus.dto.MembroEquipeResponseDTO;
import com.tis.acadus.dto.MembroStatusRequestDTO;
import com.tis.acadus.service.EquipeService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin("*")
@RequestMapping
public class EquipeController {
    private final EquipeService service;

    public EquipeController(EquipeService service) {
        this.service = service;
    }

    @GetMapping("/projetos/{projetoId}/equipe")
    public EquipeResponseDTO buscar(@PathVariable Long projetoId) {
        return service.buscar(projetoId);
    }

    @PutMapping("/projetos/{projetoId}/equipe")
    public EquipeResponseDTO salvarNome(
            @PathVariable Long projetoId,
            @RequestBody @Valid EquipeRequestDTO dto) {
        return service.salvarNome(projetoId, dto);
    }

    @DeleteMapping("/projetos/{projetoId}/equipe")
    public void excluirEquipe(@PathVariable Long projetoId) {
        service.excluirEquipe(projetoId);
    }

    @PostMapping("/projetos/{projetoId}/equipe/membros")
    public MembroEquipeResponseDTO convidar(
            @PathVariable Long projetoId,
            @RequestBody @Valid MembroEquipeRequestDTO dto) {
        return service.convidar(projetoId, dto);
    }

    @PutMapping("/equipe/membros/{membroId}/status")
    public MembroEquipeResponseDTO alterarStatus(
            @PathVariable Long membroId,
            @RequestBody @Valid MembroStatusRequestDTO dto) {
        return service.alterarStatus(membroId, dto);
    }

    @DeleteMapping("/equipe/membros/{membroId}")
    public void removerMembro(@PathVariable Long membroId) {
        service.removerMembro(membroId);
    }
}
