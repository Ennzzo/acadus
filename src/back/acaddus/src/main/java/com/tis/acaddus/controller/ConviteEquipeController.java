package com.tis.acaddus.controller;

import com.tis.acaddus.dto.ConviteEquipeDTO;
import com.tis.acaddus.model.ConviteEquipe;
import com.tis.acaddus.model.Equipe;
import com.tis.acaddus.model.EPapelEquipe;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceUnit;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/convites")
public class ConviteEquipeController {

    @PersistenceUnit
    private EntityManagerFactory emf;

    @PostMapping("/enviar/{idEquipe}/{email}/{papel}")
    public boolean enviarConvite(@PathVariable int idEquipe,
                                 @PathVariable String email,
                                 @PathVariable EPapelEquipe papel) {

        EntityManager manager = emf.createEntityManager();

        Equipe equipe = manager.find(Equipe.class, idEquipe);

        if(equipe == null) {
            return false;
        }

        boolean resposta = equipe.convidarMembro(
                email,
                "",
                papel
        );

        manager.getTransaction().begin();
        manager.persist(equipe);
        manager.getTransaction().commit();

        return resposta;
    }

    @PutMapping("/aceitar/{id}")
    public boolean aceitarConvite(@PathVariable int id) {

        EntityManager manager = emf.createEntityManager();

        ConviteEquipe convite = manager.find(ConviteEquipe.class, id);

        if(convite == null) {
            return false;
        }

        boolean resposta = convite.aceitarConvite();

        manager.getTransaction().begin();
        manager.persist(convite);
        manager.getTransaction().commit();

        return resposta;
    }

    @PutMapping("/recusar/{id}")
    public boolean recusarConvite(@PathVariable int id) {

        EntityManager manager = emf.createEntityManager();

        ConviteEquipe convite = manager.find(ConviteEquipe.class, id);

        if(convite == null) {
            return false;
        }

        boolean resposta = convite.recusarConvite();

        manager.getTransaction().begin();
        manager.persist(convite);
        manager.getTransaction().commit();

        return resposta;
    }

    @GetMapping("/visualizar/{id}")
    public ConviteEquipeDTO visualizarConvite(@PathVariable int id) {

        EntityManager manager = emf.createEntityManager();

        ConviteEquipe convite = manager.find(ConviteEquipe.class, id);

        if(convite == null) {
            return null;
        }

        return convite.dto();
    }
}