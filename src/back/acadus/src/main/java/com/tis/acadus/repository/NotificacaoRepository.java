package com.tis.acadus.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tis.acadus.entity.Notificacao;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {
    List<Notificacao> findByDestinatarioEmailIgnoreCaseOrderByDataHoraDescIdDesc(String destinatarioEmail);

    Optional<Notificacao> findFirstByTipoAndReferenciaIdOrderByIdDesc(String tipo, Long referenciaId);

    boolean existsByTipoAndReferenciaId(String tipo, Long referenciaId);
}
