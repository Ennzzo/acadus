package com.tis.acaddus.controller;

import com.tis.acaddus.dto.ProjetoDTO;
import com.tis.acaddus.model.Projeto;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceUnit;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/projetos")
public class ProjetoController {

    @PersistenceUnit
    private EntityManagerFactory emf;

    @PostMapping("/criar/{nome}/{descricao}")
    public ProjetoDTO criarProjeto(@PathVariable String nome,
                                   @PathVariable String descricao) {

        Projeto projeto = new Projeto(
                nome,
                descricao
        );

        EntityManager manager = emf.createEntityManager();

        manager.getTransaction().begin();
        manager.persist(projeto);
        manager.getTransaction().commit();

        return projeto.dto();
    }

    @PutMapping("/editar/{id}/{nome}/{descricao}")
    public boolean editarProjeto(@PathVariable int id,
                                 @PathVariable String nome,
                                 @PathVariable String descricao) {

        EntityManager manager = emf.createEntityManager();

        Projeto projeto = manager.find(Projeto.class, id);

        boolean resposta = false;

        if(projeto != null) {

            resposta = projeto.editarProjeto(
                    nome,
                    descricao
            );

            manager.getTransaction().begin();
            manager.persist(projeto);
            manager.getTransaction().commit();
        }

        return resposta;
    }

    @PutMapping("/excluir/{id}")
    public boolean excluirProjeto(@PathVariable int id) {

        EntityManager manager = emf.createEntityManager();

        Projeto projeto = manager.find(Projeto.class, id);

        if(projeto == null) {
            return false;
        }

        projeto.excluirProjeto();

        manager.getTransaction().begin();
        manager.persist(projeto);
        manager.getTransaction().commit();

        return true;
    }

    @GetMapping("/visualizar/{id}")
    public ProjetoDTO visualizarProjeto(@PathVariable int id) {

        EntityManager manager = emf.createEntityManager();

        Projeto projeto = manager.find(Projeto.class, id);

        if(projeto == null) {
            return null;
        }

        return projeto.dto();
    }
}