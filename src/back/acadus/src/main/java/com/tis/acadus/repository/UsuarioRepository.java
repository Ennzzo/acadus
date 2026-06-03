package com.tis.acadus.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tis.acadus.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByEmailIgnoreCase(String email);

}
