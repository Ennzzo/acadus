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

import com.tis.acadus.dto.EquipeUsuarioRequestDTO;
import com.tis.acadus.dto.EquipeUsuarioResponseDTO;
import com.tis.acadus.service.EquipeUsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/equipes-usuarios")
@CrossOrigin("*")
@RequiredArgsConstructor
public class EquipeUsuarioController {
    private final EquipeUsuarioService service;

    @GetMapping
    public List<EquipeUsuarioResponseDTO> listarEquipesUsuarios() {
        return service.listarEquipesUsuarios();
    }

    @GetMapping("/{id}")
    public EquipeUsuarioResponseDTO buscarEquipeUsuarioPorId(@PathVariable Long id) {
        return service.buscarEquipeUsuarioPorId(id);
    }

    @PostMapping
    public EquipeUsuarioResponseDTO criarEquipeUsuario(@RequestBody @Valid EquipeUsuarioRequestDTO dto) {
        return service.criarEquipeUsuario(dto);
    }

    @DeleteMapping("/{id}")
    public void excluirEquipeUsuario(@PathVariable Long id) {
        service.excluirEquipeUsuario(id);
    }
}
