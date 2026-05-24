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

import com.tis.acadus.dto.UsuarioRequestDTO;
import com.tis.acadus.dto.UsuarioResponseDTO;
import com.tis.acadus.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin("*")
public class UsuarioController {
    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping
    public List<UsuarioResponseDTO> listarUsuarios() {
        return service.listarUsuarios();
    }

    @GetMapping("/{id}")
    public UsuarioResponseDTO buscarUsuarioPorId(
            @PathVariable Long id) {
        return service.buscarUsuarioPorId(id);
    }

    @PostMapping
    public UsuarioResponseDTO criarUsuario(
            @RequestBody @Valid UsuarioRequestDTO dto) {
        return service.criarUsuario(dto);
    }

    @PutMapping("/{id}")
    public UsuarioResponseDTO editarUsuario(
            @PathVariable Long id,
            @RequestBody @Valid UsuarioRequestDTO dto) {
        return service.editarUsuario(id, dto);
    }

    @DeleteMapping("/{id}")
    public void excluirUsuario(@PathVariable Long id) {

        service.excluirUsuario(id);
    }
}
