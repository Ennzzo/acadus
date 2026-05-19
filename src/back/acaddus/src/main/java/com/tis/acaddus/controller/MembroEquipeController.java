package com.tis.acaddus.controller;

import com.tis.acaddus.dto.MembroEquipeDTO;
import com.tis.acaddus.model.Equipe;
import com.tis.acaddus.model.MembroEquipe;
import com.tis.acaddus.model.Usuario;
import com.tis.acaddus.model.EPapelEquipe;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceUnit;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/membros")
public class MembroEquipeController {

    @PersistenceUnit
    private EntityManagerFactory emf;

    @PostMapping("/adicionar/{idEquipe}/{idUsuario}/{papel}")
    public boolean adicionarMembro(@PathVariable int idEquipe,
                                   @PathVariable int idUsuario,
                                   @PathVariable EPapelEquipe papel) {

        EntityManager manager = emf.createEntityManager();

        Equipe equipe = manager.find(Equipe.class, idEquipe);

        Usuario usuario = manager.find(Usuario.class, idUsuario);

        if(equipe == null || usuario == null) {
            return false;
        }

        boolean resposta = equipe.adicionarMembro(
                usuario,
                papel
        );

        manager.getTransaction().begin();
        manager.persist(equipe);
        manager.getTransaction().commit();

        return resposta;
    }

    @PutMapping("/alterar-papel/{id}/{papel}")
    public boolean alterarPapel(@PathVariable int id,
                                @PathVariable EPapelEquipe papel) {

        EntityManager manager = emf.createEntityManager();

        MembroEquipe membro = manager.find(MembroEquipe.class, id);

        if(membro == null) {
            return false;
        }

        membro.alterarPapel(papel);

        manager.getTransaction().begin();
        manager.persist(membro);
        manager.getTransaction().commit();

        return true;
    }

    @DeleteMapping("/remover/{idEquipe}/{idUsuario}")
    public boolean removerMembro(@PathVariable int idEquipe,
                                 @PathVariable int idUsuario) {

        EntityManager manager = emf.createEntityManager();

        Equipe equipe = manager.find(Equipe.class, idEquipe);

        if(equipe == null) {
            return false;
        }

        boolean resposta = equipe.removerMembro(idUsuario);

        manager.getTransaction().begin();
        manager.persist(equipe);
        manager.getTransaction().commit();

        return resposta;
    }

    @GetMapping("/visualizar/{id}")
    public MembroEquipeDTO visualizarMembro(@PathVariable int id) {

        EntityManager manager = emf.createEntityManager();

        MembroEquipe membro = manager.find(MembroEquipe.class, id);

        if(membro == null) {
            return null;
        }

        return membro.dto();
    }
}