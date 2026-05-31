package com.tis.acadus.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tis.acadus.entity.ChatLeitura;

public interface ChatLeituraRepository extends JpaRepository<ChatLeitura, Long> {
    Optional<ChatLeitura> findByUsuarioEmailIgnoreCaseAndTipoChat(String usuarioEmail, String tipoChat);
}
