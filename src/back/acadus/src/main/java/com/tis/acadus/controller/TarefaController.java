package com.tis.acadus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tis.acadus.dto.TarefaRequestDTO;
import com.tis.acadus.dto.TarefaResponseDTO;
import com.tis.acadus.dto.MovimentoTarefaDTO;
import com.tis.acadus.entity.Tarefa;
import com.tis.acadus.service.QuadroService;
import com.tis.acadus.service.TarefaService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin("*")
@RequestMapping
public class TarefaController {
    private final TarefaService service;
    private final QuadroService quadroService;

    public TarefaController(TarefaService service, QuadroService quadroService) {
        this.service = service;
        this.quadroService = quadroService;
    }

    @GetMapping("/projetos/{projetoId}/tarefas")
    public List<TarefaResponseDTO> listar(@PathVariable Long projetoId) {
        return service.listarPorProjeto(projetoId).stream()
                .map(service::toDto)
                .toList();
    }

    @GetMapping("/projetos/{projetoId}/tarefas/lixeira")
    public List<TarefaResponseDTO> listarLixeira(@PathVariable Long projetoId) {
        return service.listarLixeira(projetoId).stream()
                .map(service::toDto)
                .toList();
    }

    @PostMapping("/projetos/{projetoId}/tarefas")
    public TarefaResponseDTO criar(
            @PathVariable Long projetoId,
            @RequestParam String email,
            @RequestBody @Valid TarefaRequestDTO dto) {

        Tarefa tarefa = service.criar(projetoId, dto, email);

        return service.toDto(tarefa);
    }

    @PutMapping("/tarefas/{id}")
    public TarefaResponseDTO editar(
            @PathVariable Long id,
            @RequestParam String email,
            @RequestBody @Valid TarefaRequestDTO dto) {

        Tarefa tarefa = service.editar(id, dto, email);

        return service.toDto(tarefa);
    }

    @DeleteMapping("/tarefas/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id, @RequestParam String email) {
        service.excluir(id, email);
    }

    @DeleteMapping("/tarefas/{id}/definitivo")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirDefinitivo(@PathVariable Long id, @RequestParam String email) {
        service.excluirDefinitivo(id, email);
    }

    @PutMapping("/tarefas/{id}/movimento")
    public TarefaResponseDTO mover(
            @PathVariable Long id,
            @RequestParam String email,
            @RequestBody @Valid MovimentoTarefaDTO dto) {
        return service.toDto(quadroService.moverTarefa(id, dto, email));
    }

    @PutMapping("/tarefas/{id}/restaurar")
    public TarefaResponseDTO restaurar(
            @PathVariable Long id,
            @RequestParam String email,
            @RequestBody @Valid MovimentoTarefaDTO dto) {
        return service.toDto(service.restaurar(id, dto.getColunaId(), email));
    }
}
