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

import com.tis.acadus.dto.LoginRequestDTO;
import com.tis.acadus.dto.PerfilRequestDTO;
import com.tis.acadus.dto.UsuarioRequestDTO;
import com.tis.acadus.dto.UsuarioResponseDTO;
import com.tis.acadus.entity.Usuario;
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
        return service.listarUsuarios().stream()
                .map(service::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public UsuarioResponseDTO buscarUsuarioPorId(
            @PathVariable Long id) {

        Usuario usuario = service.buscarUsuarioPorId(id);

        return service.toDto(usuario);
    }

    @PostMapping
    public UsuarioResponseDTO criarUsuario(
            @RequestBody @Valid UsuarioRequestDTO dto) {

        Usuario usuario = service.criarUsuario(dto);

        return service.toDto(usuario);
    }

    @PostMapping("/login")
    public UsuarioResponseDTO login(
            @RequestBody @Valid LoginRequestDTO dto) {

        Usuario usuario = service.login(dto);

        return service.toDto(usuario);
    }

    @PutMapping("/{id}")
    public UsuarioResponseDTO editarUsuario(
            @PathVariable Long id,
            @RequestBody @Valid UsuarioRequestDTO dto) {

        Usuario usuario = service.editarUsuario(id, dto);

        return service.toDto(usuario);
    }

    @PutMapping("/{id}/perfil")
    public UsuarioResponseDTO editarPerfil(
            @PathVariable Long id,
            @RequestBody @Valid PerfilRequestDTO dto) {

        return service.toDto(service.editarPerfil(id, dto));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirUsuario(@PathVariable Long id) {

        service.excluirUsuario(id);
    }
}
