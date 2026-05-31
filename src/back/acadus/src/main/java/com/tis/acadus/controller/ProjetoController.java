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
    public List<ProjetoResponseDTO> listarProjetos(@RequestParam String email) {
        return service.listarProjetos(email).stream()
                .map(service::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public ProjetoResponseDTO buscarProjetoPorId(@PathVariable Long id, @RequestParam String email) {
        return service.toDto(service.buscarProjetoDoUsuario(id, email));
    }

    @PostMapping
    public ProjetoResponseDTO criarProjeto(
            @RequestBody @Valid ProjetoRequestDTO dto) {

        return service.toDto(service.criarProjeto(dto));
    }

    @PutMapping("/{id}")
    public ProjetoResponseDTO editarProjeto(
            @PathVariable Long id,
            @RequestParam String email,
            @RequestBody @Valid ProjetoRequestDTO dto) {

        return service.toDto(service.editarProjeto(id, dto, email));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirProjeto(@PathVariable Long id, @RequestParam String email) {

        service.excluirProjeto(id, email);
    }
}
