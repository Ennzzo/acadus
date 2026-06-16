package com.tis.acadus.controller;

import com.tis.acadus.dto.EventoDTO;
import com.tis.acadus.entity.Evento;
import com.tis.acadus.service.EventoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/eventos")
@CrossOrigin(origins = "http://localhost:3000")
public class EventoController {
    
    @Autowired
    private EventoService eventoService;
    
    @PostMapping
    public ResponseEntity<EventoDTO> criarEvento(@RequestBody EventoDTO dto) {
        try {
            Evento evento = new Evento(
                    dto.nome(),
                    dto.descricao(),
                    dto.data(),
                    dto.projetoId(),
                    dto.equipeId(),
                    dto.responsavelId(),
                    dto.membrosIds()
            );
            Evento salvo = eventoService.criarEvento(evento);
            return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(salvo));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EventoDTO> obterEvento(@PathVariable Long id) {
        return eventoService.obterEvento(id)
                .map(evento -> ResponseEntity.ok(toDTO(evento)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    public ResponseEntity<List<EventoDTO>> listarEventos() {
        List<EventoDTO> eventos = eventoService.listarEventos()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(eventos);
    }
    
    @GetMapping("/mes/{ano}/{mes}")
    public ResponseEntity<List<EventoDTO>> listarEventosPorMes(@PathVariable int ano, @PathVariable int mes) {
        List<EventoDTO> eventos = eventoService.listarEventosPorMes(ano, mes)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(eventos);
    }
    
    @GetMapping("/equipe/{equipeId}/mes/{ano}/{mes}")
    public ResponseEntity<List<EventoDTO>> listarEventosPorEquipeAndMes(
            @PathVariable Long equipeId,
            @PathVariable int ano,
            @PathVariable int mes) {
        List<EventoDTO> eventos = eventoService.listarEventosPorEquipeAndMes(equipeId, ano, mes)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(eventos);
    }
    
    @GetMapping("/equipe/{equipeId}")
    public ResponseEntity<List<EventoDTO>> listarEventosPorEquipe(@PathVariable Long equipeId) {
        List<EventoDTO> eventos = eventoService.listarEventosPorEquipe(equipeId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(eventos);
    }
    
    @GetMapping("/projeto/{projetoId}")
    public ResponseEntity<List<EventoDTO>> listarEventosPorProjeto(@PathVariable Long projetoId) {
        List<EventoDTO> eventos = eventoService.listarEventosPorProjeto(projetoId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(eventos);
    }

    @GetMapping("/projeto/{projetoId}/mes/{ano}/{mes}")
    public ResponseEntity<List<EventoDTO>> listarEventosPorProjetoAndMes(
            @PathVariable Long projetoId,
            @PathVariable int ano,
            @PathVariable int mes) {
        List<EventoDTO> eventos = eventoService.listarEventosPorProjetoAndMes(projetoId, ano, mes)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(eventos);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<EventoDTO> atualizarEvento(
            @PathVariable Long id,
            @RequestBody EventoDTO dto) {
        try {
            Evento evento = new Evento(
                    dto.nome(),
                    dto.descricao(),
                    dto.data(),
                    dto.projetoId(),
                    dto.equipeId(),
                    dto.responsavelId(),
                    dto.membrosIds()
            );
            evento.setId(id);
            Evento atualizado = eventoService.atualizarEvento(id, evento);
            return ResponseEntity.ok(toDTO(atualizado));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirEvento(@PathVariable Long id) {
        if (eventoService.obterEvento(id).isPresent()) {
            eventoService.excluirEvento(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    private EventoDTO toDTO(Evento evento) {
        return new EventoDTO(
                evento.getId(),
                evento.getNome(),
                evento.getDescricao(),
                evento.getData(),
                evento.getProjetoId(),
                evento.getEquipeId(),
                evento.getResponsavelId(),
                evento.getMembrosIds()
        );
    }
}
