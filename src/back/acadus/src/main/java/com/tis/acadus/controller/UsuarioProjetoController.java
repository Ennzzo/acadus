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
@RequestMapping("/usuarios-projetos")
@CrossOrigin("*")
@RequiredArgsConstructor
public class UsuarioProjetoController {
    private final UsuarioProjetoService service;

    @GetMapping
    public List<UsuarioProjetoResponseDTO> listarUsuariosProjetos() {
        return service.listarUsuariosProjetos();
    }

    @PostMapping
    public UsuarioProjetoResponseDTO criarUsuariosProjetos(
            @RequestBody @Valid UsuarioProjetoRequestDTO dto) {
        return service.criarUsuariosProjetos(dto);
    }

    @DeleteMapping("/{id}")
    public void excluirUsuariosProjetos(@PathVariable Long id) {
        service.excluirUsuariosProjetos(id);
    }
}
