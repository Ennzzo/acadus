package com.tis.acadus.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tis.acadus.dto.NotificacaoResponseDTO;
import com.tis.acadus.service.NotificacaoService;

@RestController
@CrossOrigin("*")
@RequestMapping("/notificacoes")
public class NotificacaoController {
    private final NotificacaoService service;

    public NotificacaoController(NotificacaoService service) {
        this.service = service;
    }

    @GetMapping
    public List<NotificacaoResponseDTO> listar(@RequestParam String email) {
        return service.listar(email);
    }
}
