package com.tis.acadus.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tis.acadus.dto.TarefaRequestDTO;
import com.tis.acadus.dto.TarefaResponseDTO;
import com.tis.acadus.entity.Tarefa;
import com.tis.acadus.service.TarefaService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin("*")
@RequestMapping
public class TarefaController {
    private final TarefaService service;

    public TarefaController(TarefaService service) {
        this.service = service;
    }

    @GetMapping("/projetos/{projetoId}/tarefas")
    public List<TarefaResponseDTO> listar(@PathVariable Long projetoId) {
        return service.listarPorProjeto(projetoId).stream()
                .map(service::toDto)
                .toList();
    }

    @PostMapping("/projetos/{projetoId}/tarefas")
    public TarefaResponseDTO criar(
            @PathVariable Long projetoId,
            @RequestBody @Valid TarefaRequestDTO dto) {

        Tarefa tarefa = service.criar(projetoId, dto);

        return service.toDto(tarefa);
    }

    @PutMapping("/tarefas/{id}")
    public TarefaResponseDTO editar(
            @PathVariable Long id,
            @RequestBody @Valid TarefaRequestDTO dto) {

        Tarefa tarefa = service.editar(id, dto);

        return service.toDto(tarefa);
    }

    @DeleteMapping("/tarefas/{id}")
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}
