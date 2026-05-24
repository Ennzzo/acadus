package com.tis.acadus.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tis.acadus.dto.EquipeRequestDTO;
import com.tis.acadus.dto.EquipeResponseDTO;
import com.tis.acadus.dto.BloqueioMembroRequestDTO;
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
    @ResponseStatus(HttpStatus.NO_CONTENT)
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

    @PutMapping("/equipe/membros/{membroId}/lideranca")
    public MembroEquipeResponseDTO pedirLideranca(@PathVariable Long membroId) {
        return service.pedirLideranca(membroId);
    }

    @PutMapping("/equipe/membros/{membroId}/lideranca/aceitar")
    public MembroEquipeResponseDTO aceitarLideranca(@PathVariable Long membroId) {
        return service.aceitarLideranca(membroId);
    }

    @PutMapping("/equipe/membros/{membroId}/lideranca/recusar")
    public MembroEquipeResponseDTO recusarLideranca(@PathVariable Long membroId) {
        return service.recusarLideranca(membroId);
    }

    @PutMapping("/equipe/membros/{membroId}/bloqueio")
    public MembroEquipeResponseDTO bloquear(
            @PathVariable Long membroId,
            @RequestBody @Valid BloqueioMembroRequestDTO dto) {
        return service.bloquear(membroId, dto);
    }

    @DeleteMapping("/equipe/membros/{membroId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerMembro(@PathVariable Long membroId) {
        service.removerMembro(membroId);
    }
}
