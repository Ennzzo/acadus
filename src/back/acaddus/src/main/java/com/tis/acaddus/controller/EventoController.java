package com.tis.acaddus.controller;

import com.tis.acaddus.dto.EventoDTO;
import com.tis.acaddus.model.Evento;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceUnit;

import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/eventos")
public class EventoController {

    @PersistenceUnit
    private EntityManagerFactory emf;

    @PostMapping("/criar")
    public EventoDTO criarEvento(@RequestBody EventoDTO dados) {

        Date data = dados.data();

        Evento evento = new Evento(
                dados.nome(),
                dados.descricao(),
                data,
                dados.projetoId(),
                dados.membrosIds()
        );

        if (!evento.criarEvento()) {
            return null;
        }

        EntityManager manager = emf.createEntityManager();

        manager.getTransaction().begin();
        manager.persist(evento);
        manager.getTransaction().commit();

        return evento.dto();
    }

    @PutMapping("/editar/{id}")
    public boolean editarEvento(@PathVariable int id,
                                @RequestBody EventoDTO dados) {

        EntityManager manager = emf.createEntityManager();

        Evento evento = manager.find(Evento.class, id);

        if (evento == null) {
            return false;
        }

        boolean resposta = evento.editarEvento(
                dados.nome(),
                dados.descricao(),
                dados.data(),
                dados.projetoId(),
                dados.membrosIds()
        );

        if (resposta) {
            manager.getTransaction().begin();
            manager.persist(evento);
            manager.getTransaction().commit();
        }

        return resposta;
    }

    @DeleteMapping("/excluir/{id}")
    public boolean excluirEvento(@PathVariable int id) {

        EntityManager manager = emf.createEntityManager();

        Evento evento = manager.find(Evento.class, id);

        if (evento == null) {
            return false;
        }

        manager.getTransaction().begin();
        manager.remove(evento);
        manager.getTransaction().commit();

        return true;
    }

    @GetMapping("/visualizar/{id}")
    public EventoDTO visualizarEvento(@PathVariable int id) {

        EntityManager manager = emf.createEntityManager();

        Evento evento = manager.find(Evento.class, id);

        if (evento == null) {
            return null;
        }

        return evento.dto();
    }

    @GetMapping("/listar")
    public List<EventoDTO> listarEventos() {

        EntityManager manager = emf.createEntityManager();

        List<Evento> eventos = manager
                .createQuery("SELECT e FROM Evento e", Evento.class)
                .getResultList();

        return eventos.stream().map(Evento::dto).toList();
    }

    @GetMapping("/listar/{ano}/{mes}")
    public List<EventoDTO> listarEventosPorMes(@PathVariable int ano,
                                                @PathVariable int mes) {

        EntityManager manager = emf.createEntityManager();

        List<Evento> eventos = manager
                .createQuery(
                        "SELECT e FROM Evento e WHERE YEAR(e.data) = :ano AND MONTH(e.data) = :mes",
                        Evento.class
                )
                .setParameter("ano", ano)
                .setParameter("mes", mes)
                .getResultList();

        return eventos.stream().map(Evento::dto).toList();
    }
}
