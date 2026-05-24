package com.tis.acadus.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tis.acadus.dto.UsuarioProjetoRequestDTO;
import com.tis.acadus.dto.UsuarioProjetoResponseDTO;
import com.tis.acadus.service.UsuarioProjetoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/usuario-projeto")
@CrossOrigin("*")
@RequiredArgsConstructor
public class UsuarioProjetoController {
    private final UsuarioProjetoService service;

    @GetMapping
    public List<UsuarioProjetoResponseDTO> listar() {
        return service.listar();
    }

    @PostMapping
    public UsuarioProjetoResponseDTO criar(
            @RequestBody @Valid UsuarioProjetoRequestDTO dto) {
        return service.criar(dto);
    }

    @DeleteMapping("/{id}")
    public void remover(@PathVariable Long id) {
        service.remover(id);
    }
}
