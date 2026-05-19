package com.tis.acaddus.controller;

import com.tis.acaddus.dto.EquipeDTO;
import com.tis.acaddus.model.Equipe;
import com.tis.acaddus.model.Projeto;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceUnit;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/equipes")
public class EquipeController {

    @PersistenceUnit
    private EntityManagerFactory emf;

    @PostMapping("/criar/{nome}/{idProjeto}")
    public EquipeDTO criarEquipe(@PathVariable String nome,
                                 @PathVariable int idProjeto) {

        EntityManager manager = emf.createEntityManager();

        Projeto projeto = manager.find(Projeto.class, idProjeto);

        if(projeto == null) {
            return null;
        }

        Equipe equipe = new Equipe(
                nome,
                projeto
        );

        if(!equipe.criarEquipe()) {
            return null;
        }

        manager.getTransaction().begin();
        manager.persist(equipe);
        manager.getTransaction().commit();

        return equipe.dto();
    }

    @PutMapping("/editar/{id}/{nome}")
    public boolean editarEquipe(@PathVariable int id,
                                @PathVariable String nome) {

        EntityManager manager = emf.createEntityManager();

        Equipe equipe = manager.find(Equipe.class, id);

        if(equipe == null) {
            return false;
        }

        boolean resposta = equipe.editarEquipe(nome);

        manager.getTransaction().begin();
        manager.persist(equipe);
        manager.getTransaction().commit();

        return resposta;
    }

    @PutMapping("/excluir/{id}")
    public boolean excluirEquipe(@PathVariable int id) {

        EntityManager manager = emf.createEntityManager();

        Equipe equipe = manager.find(Equipe.class, id);

        if(equipe == null) {
            return false;
        }

        equipe.excluirEquipe();

        manager.getTransaction().begin();
        manager.persist(equipe);
        manager.getTransaction().commit();

        return true;
    }

    @GetMapping("/visualizar/{id}")
    public EquipeDTO visualizarEquipe(@PathVariable int id) {

        EntityManager manager = emf.createEntityManager();

        Equipe equipe = manager.find(Equipe.class, id);

        if(equipe == null) {
            return null;
        }

        return equipe.dto();
    }
}