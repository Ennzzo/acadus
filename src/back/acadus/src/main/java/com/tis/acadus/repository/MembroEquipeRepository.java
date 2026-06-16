package com.tis.acadus.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tis.acadus.entity.MembroEquipe;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.entity.enums.PapelMembro;
import com.tis.acadus.entity.enums.StatusConvite;

public interface MembroEquipeRepository extends JpaRepository<MembroEquipe, Long> {
    List<MembroEquipe> findByProjetoIdOrderByIdAsc(Long projetoId);

    List<MembroEquipe> findByEmailOrderByIdDesc(String email);

    Optional<MembroEquipe> findFirstByProjetoIdAndEmailIgnoreCaseOrderByIdDesc(Long projetoId, String email);

    Optional<MembroEquipe> findFirstByProjetoIdAndEmailIgnoreCaseAndStatusOrderByIdDesc(
            Long projetoId, String email, StatusConvite status);

    @Query("""
            select distinct membro.projeto
            from MembroEquipe membro
            where lower(membro.email) = lower(:email)
              and membro.status = :status
              and membro.dataSaida is null
            """)
    List<Projeto> findProjetosByEmailAndStatus(
            @Param("email") String email,
            @Param("status") StatusConvite status);

    @Query("""
            select distinct membro.projeto
            from MembroEquipe membro
            where lower(membro.email) = lower(:email)
              and membro.status in :status
            """)
    List<Projeto> findProjetosByEmailAndStatusIn(
            @Param("email") String email,
            @Param("status") List<StatusConvite> status);

    boolean existsByProjetoIdAndEmailIgnoreCaseAndStatusAndDataSaidaIsNull(
            Long projetoId, String email, StatusConvite status);

    Optional<MembroEquipe> findFirstByProjetoIdAndPapelAndStatus(Long projetoId, PapelMembro papel, StatusConvite status);

    List<MembroEquipe> findByEmailIgnoreCaseAndStatus(String email, StatusConvite status);

    void deleteByProjetoId(Long projetoId);
}
