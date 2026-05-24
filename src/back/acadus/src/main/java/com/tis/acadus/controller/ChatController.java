package com.tis.acadus.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tis.acadus.dto.ChatMensagemRequestDTO;
import com.tis.acadus.dto.ChatMensagemResponseDTO;
import com.tis.acadus.service.ChatService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin("*")
@RequestMapping
public class ChatController {
    private final ChatService service;

    public ChatController(ChatService service) {
        this.service = service;
    }

    @GetMapping("/projetos/{projetoId}/chat")
    public List<ChatMensagemResponseDTO> listar(
            @PathVariable Long projetoId,
            @RequestParam(defaultValue = "EQUIPE") String tipo) {
        return service.listar(projetoId, tipo).stream()
                .map(service::toDto)
                .toList();
    }

    @PostMapping("/projetos/{projetoId}/chat")
    public ChatMensagemResponseDTO enviar(
            @PathVariable Long projetoId,
            @RequestBody @Valid ChatMensagemRequestDTO dto) {
        return service.toDto(service.enviar(projetoId, dto));
    }

    @PutMapping("/chat/{id}")
    public ChatMensagemResponseDTO editar(
            @PathVariable Long id,
            @RequestBody @Valid ChatMensagemRequestDTO dto) {
        return service.toDto(service.editar(id, dto));
    }

    @DeleteMapping("/chat/{id}")
    public ChatMensagemResponseDTO excluir(@PathVariable Long id) {
        return service.toDto(service.excluir(id));
    }
}
