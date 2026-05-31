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

import com.tis.acadus.dto.ChatContatoResponseDTO;
import com.tis.acadus.dto.ChatMensagemRequestDTO;
import com.tis.acadus.dto.ChatMensagemResponseDTO;
import com.tis.acadus.dto.ChatProjetoResponseDTO;
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

    @GetMapping("/chats")
    public List<ChatProjetoResponseDTO> listarProjetos(@RequestParam String email) {
        return service.listarProjetos(email);
    }

    @GetMapping("/chats/privados")
    public List<ChatContatoResponseDTO> listarContatos(@RequestParam String email) {
        return service.listarContatos(email);
    }

    @GetMapping("/chats/nao-visualizados")
    public boolean temNaoVisualizadas(@RequestParam String email) {
        return service.temNaoVisualizadas(email);
    }

    @GetMapping("/chats/usuarios")
    public ChatContatoResponseDTO buscarContato(@RequestParam String email) {
        return service.buscarContato(email);
    }

    @GetMapping("/chat/privado")
    public List<ChatMensagemResponseDTO> listarPrivado(
            @RequestParam String email,
            @RequestParam String destinatario) {
        return service.listarPrivado(email, destinatario).stream()
                .map(service::toDto)
                .toList();
    }

    @PostMapping("/chat/privado")
    public ChatMensagemResponseDTO enviarPrivado(
            @RequestParam String email,
            @RequestParam String destinatario,
            @RequestBody @Valid ChatMensagemRequestDTO dto) {
        return service.toDto(service.enviarPrivado(email, destinatario, dto));
    }

    @PutMapping("/chat/privado/leitura")
    public void marcarPrivadoComoVisualizado(@RequestParam String email, @RequestParam String destinatario) {
        service.marcarPrivadoComoVisualizado(email, destinatario);
    }

    @DeleteMapping("/chat/privado")
    public void ocultarPrivado(@RequestParam String email, @RequestParam String destinatario) {
        service.ocultarPrivado(email, destinatario);
    }

    @GetMapping("/projetos/{projetoId}/chat")
    public List<ChatMensagemResponseDTO> listar(
            @PathVariable Long projetoId,
            @RequestParam(defaultValue = "EQUIPE") String tipo,
            @RequestParam String email) {
        return service.listar(projetoId, tipo, email).stream()
                .map(service::toDto)
                .toList();
    }

    @PostMapping("/projetos/{projetoId}/chat")
    public ChatMensagemResponseDTO enviar(
            @PathVariable Long projetoId,
            @RequestParam String email,
            @RequestBody @Valid ChatMensagemRequestDTO dto) {
        return service.toDto(service.enviar(projetoId, dto, email));
    }

    @PutMapping("/projetos/{projetoId}/chat/leitura")
    public void marcarEquipeComoVisualizada(@PathVariable Long projetoId, @RequestParam String email) {
        service.marcarEquipeComoVisualizada(projetoId, email);
    }

    @DeleteMapping("/projetos/{projetoId}/chat")
    public void ocultarEquipe(@PathVariable Long projetoId, @RequestParam String email) {
        service.ocultarEquipe(projetoId, email);
    }

    @PutMapping("/chat/{id}")
    public ChatMensagemResponseDTO editar(
            @PathVariable Long id,
            @RequestParam String email,
            @RequestBody @Valid ChatMensagemRequestDTO dto) {
        return service.toDto(service.editar(id, dto, email));
    }

    @DeleteMapping("/chat/{id}")
    public ChatMensagemResponseDTO excluir(@PathVariable Long id, @RequestParam String email) {
        return service.toDto(service.excluir(id, email));
    }
}
