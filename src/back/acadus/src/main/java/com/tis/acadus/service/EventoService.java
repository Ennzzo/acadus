package com.tis.acadus.service;

import com.tis.acadus.entity.Evento;
import com.tis.acadus.repository.EventoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventoService {
    
    @Autowired
    private EventoRepository eventoRepository;
    
    public Evento criarEvento(Evento evento) {
        if (evento.getNome() == null || evento.getNome().isEmpty() || evento.getNome().length() > 100) {
            throw new IllegalArgumentException("Nome inválido");
        }
        if (evento.getData() == null) {
            throw new IllegalArgumentException("Data é obrigatória");
        }
        if (evento.getDescricao() != null && evento.getDescricao().length() > 500) {
            throw new IllegalArgumentException("Descrição muito longa");
        }
        if (evento.getCor() == null || evento.getCor().isBlank()) {
            evento.setCor("#2563eb");
        }
        return eventoRepository.save(evento);
    }
    
    public Optional<Evento> obterEvento(Long id) {
        return eventoRepository.findById(id);
    }
    
    public List<Evento> listarEventos() {
        return eventoRepository.findAll();
    }
    
    public List<Evento> listarEventosPorMes(int ano, int mes) {
        return eventoRepository.findByMes(ano, mes);
    }
    
    public List<Evento> listarEventosPorEquipeAndMes(Long equipeId, int ano, int mes) {
        return eventoRepository.findByEquipeAndMes(equipeId, ano, mes);
    }
    
    public List<Evento> listarEventosPorEquipe(Long equipeId) {
        return eventoRepository.findByEquipeId(equipeId);
    }
    
    public List<Evento> listarEventosPorProjeto(Long projetoId) {
        return eventoRepository.findByProjetoId(projetoId);
    }
    
    public Evento atualizarEvento(Long id, Evento eventoAtualizado) {
        return eventoRepository.findById(id).map(evento -> {
            if (eventoAtualizado.getNome() != null) {
                evento.setNome(eventoAtualizado.getNome());
            }
            if (eventoAtualizado.getData() != null) {
                evento.setData(eventoAtualizado.getData());
            }
            if (eventoAtualizado.getDescricao() != null) {
                evento.setDescricao(eventoAtualizado.getDescricao());
            }
            if (eventoAtualizado.getProjetoId() != null) {
                evento.setProjetoId(eventoAtualizado.getProjetoId());
            }
            if (eventoAtualizado.getEquipeId() != null) {
                evento.setEquipeId(eventoAtualizado.getEquipeId());
            }
            if (eventoAtualizado.getResponsavelId() != null) {
                evento.setResponsavelId(eventoAtualizado.getResponsavelId());
            }
            if (eventoAtualizado.getCor() != null) {
                evento.setCor(eventoAtualizado.getCor());
            }
            if (eventoAtualizado.getMembrosIds() != null) {
                evento.setMembrosIds(eventoAtualizado.getMembrosIds());
            }
            return eventoRepository.save(evento);
        }).orElseThrow(() -> new RuntimeException("Evento não encontrado"));
    }
    
    public List<Evento> listarEventosPorProjetoAndMes(Long projetoId, int ano, int mes) {
        return eventoRepository.findByProjetoAndMes(projetoId, ano, mes);
    }

    public void excluirEvento(Long id) {
        eventoRepository.deleteById(id);
    }
}
