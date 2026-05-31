package com.tis.acadus.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tis.acadus.entity.ChatOculto;

public interface ChatOcultoRepository extends JpaRepository<ChatOculto, Long> {
    Optional<ChatOculto> findByUsuarioEmailIgnoreCaseAndTipoChat(String usuarioEmail, String tipoChat);
}
