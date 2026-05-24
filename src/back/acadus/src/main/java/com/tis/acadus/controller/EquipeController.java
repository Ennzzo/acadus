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

import com.tis.acadus.dto.EquipeRequestDTO;
import com.tis.acadus.dto.EquipeResponseDTO;
import com.tis.acadus.service.EquipeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/equipes")
@CrossOrigin("*")
@RequiredArgsConstructor
public class EquipeController {
    private final EquipeService service;

    @GetMapping
    public List<EquipeResponseDTO> listarEquipes() {
        return service.listarEquipes();
    }

    @GetMapping("/{id}")
    public EquipeResponseDTO buscarEquipePorId(@PathVariable Long id) {
        return service.buscarEquipePorId(id);
    }

    @PostMapping
    public EquipeResponseDTO criarEquipe(@RequestBody @Valid EquipeRequestDTO dto) {
        return service.criarEquipe(dto);
    }

    @PutMapping("/{id}")
    public EquipeResponseDTO editarEquipe(@PathVariable Long id, @RequestBody @Valid EquipeRequestDTO dto) {
        return service.editarEquipe(id, dto);
    }

    @DeleteMapping("/{id}")
    public void excluirEquipe(@PathVariable Long id) {
        service.excluirEquipe(id);
    }
}
