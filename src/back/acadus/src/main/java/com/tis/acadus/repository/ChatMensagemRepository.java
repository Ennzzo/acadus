package com.tis.acadus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tis.acadus.entity.ChatMensagem;

public interface ChatMensagemRepository extends JpaRepository<ChatMensagem, Long> {
    List<ChatMensagem> findByProjetoIdAndTipoChatOrderByDataHoraAscIdAsc(Long projetoId, String tipoChat);

    List<ChatMensagem> findByTipoChatOrderByDataHoraAscIdAsc(String tipoChat);

    List<ChatMensagem> findByTipoChatStartingWithOrderByDataHoraDescIdDesc(String tipoChat);

    void deleteByProjetoId(Long projetoId);
}
