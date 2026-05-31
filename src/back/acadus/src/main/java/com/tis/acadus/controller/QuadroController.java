package com.tis.acadus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tis.acadus.dto.ColunaRequestDTO;
import com.tis.acadus.dto.OrdemColunasDTO;
import com.tis.acadus.dto.QuadroColunaDTO;
import com.tis.acadus.dto.RestaurarColunaDTO;
import com.tis.acadus.service.QuadroService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin("*")
public class QuadroController {
    private final QuadroService service;

    public QuadroController(QuadroService service) {
        this.service = service;
    }

    @GetMapping("/projetos/{projetoId}/colunas")
    public List<QuadroColunaDTO> listar(
            @PathVariable Long projetoId,
            @RequestParam String email,
            @RequestParam(defaultValue = "false") boolean excluidas) {
        return service.listar(projetoId, excluidas, email);
    }

    @PostMapping("/projetos/{projetoId}/colunas")
    public QuadroColunaDTO criar(
            @PathVariable Long projetoId,
            @RequestParam String email,
            @RequestBody @Valid ColunaRequestDTO dto) {
        return service.toDto(service.criar(projetoId, dto.getNome(), email));
    }

    @PutMapping("/colunas/{id}")
    public QuadroColunaDTO renomear(
            @PathVariable Long id,
            @RequestParam String email,
            @RequestBody @Valid ColunaRequestDTO dto) {
        return service.toDto(service.renomear(id, dto.getNome(), email));
    }

    @PutMapping("/projetos/{projetoId}/colunas/ordem")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void ordenar(@PathVariable Long projetoId, @RequestParam String email, @RequestBody OrdemColunasDTO dto) {
        service.ordenar(projetoId, dto.getIds(), email);
    }

    @DeleteMapping("/colunas/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id, @RequestParam String email) {
        service.excluir(id, email);
    }

    @PutMapping("/colunas/{id}/restaurar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void restaurar(@PathVariable Long id, @RequestParam String email, @RequestBody RestaurarColunaDTO dto) {
        service.restaurar(id, dto.getTarefaIds(), email);
    }

    @DeleteMapping("/colunas/{id}/definitivo")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirDefinitivo(@PathVariable Long id, @RequestParam String email) {
        service.excluirDefinitivo(id, email);
    }
}
