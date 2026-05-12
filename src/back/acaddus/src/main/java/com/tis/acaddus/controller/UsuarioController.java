package com.tis.acaddus.controller;

import com.tis.acaddus.dto.UsuarioDTO;
import com.tis.acaddus.model.Usuario;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceUnit;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @PersistenceUnit
    private EntityManagerFactory emf;

    @PostMapping("/cadastro/{nome}/{sobrenome}/{email}/{senha}")
    public UsuarioDTO cadastrarUsuario(@PathVariable String nome,
                                       @PathVariable String sobrenome,
                                       @PathVariable String email,
                                       @PathVariable String senha) {

        Usuario usuario = new Usuario(
                nome,
                sobrenome,
                email,
                senha
        );

        EntityManager manager = emf.createEntityManager();

        manager.getTransaction().begin();
        manager.persist(usuario);
        manager.getTransaction().commit();

        return usuario.dto();
    }

    @GetMapping("/visualizar/{id}")
    public String visualizarUsuario(@PathVariable int id) {

        EntityManager manager = emf.createEntityManager();

        Usuario usuario = manager.find(Usuario.class, id);

        if(usuario == null) {
            return "Usuário não encontrado.";
        }

        return usuario.visualizarUsuario();
    }

    @GetMapping("/login/{email}/{senha}")
    public boolean login(@PathVariable String email,
                         @PathVariable String senha) {

        EntityManager manager = emf.createEntityManager();

        Usuario usuario = manager.createQuery("""
                SELECT u
                FROM Usuario u
                WHERE u.email = :email
                """, Usuario.class)
                .setParameter("email", email)
                .getResultStream()
                .findFirst()
                .orElse(null);

        if(usuario == null) {
            return false;
        }

        return usuario.login(email, senha);
    }
}