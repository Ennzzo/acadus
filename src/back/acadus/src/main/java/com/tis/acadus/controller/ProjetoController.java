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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tis.acadus.dto.ProjetoRequestDTO;
import com.tis.acadus.dto.ProjetoResponseDTO;
import com.tis.acadus.service.ProjetoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/projetos")
@CrossOrigin("*")
public class ProjetoController {
    private final ProjetoService service;

    public ProjetoController(ProjetoService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProjetoResponseDTO> listarProjetos() {
        return service.listarProjetos().stream()
                .map(service::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public ProjetoResponseDTO buscarProjetoPorId(@PathVariable Long id) {
        return service.toDto(service.buscarProjetoPorId(id));
    }

    @PostMapping
    public ProjetoResponseDTO criarProjeto(
            @RequestBody @Valid ProjetoRequestDTO dto) {

        return service.toDto(service.criarProjeto(dto));
    }

    @PutMapping("/{id}")
    public ProjetoResponseDTO editarProjeto(
            @PathVariable Long id,
            @RequestBody @Valid ProjetoRequestDTO dto) {

        return service.toDto(service.editarProjeto(id, dto));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirProjeto(@PathVariable Long id) {

        service.excluirProjeto(id);
    }
}
