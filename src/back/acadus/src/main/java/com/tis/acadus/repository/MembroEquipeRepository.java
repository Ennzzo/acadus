package com.tis.acadus.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tis.acadus.entity.MembroEquipe;
import com.tis.acadus.entity.enums.PapelMembro;
import com.tis.acadus.entity.enums.StatusConvite;

public interface MembroEquipeRepository extends JpaRepository<MembroEquipe, Long> {
    List<MembroEquipe> findByProjetoIdOrderByIdAsc(Long projetoId);

    List<MembroEquipe> findByEmailOrderByIdDesc(String email);

    Optional<MembroEquipe> findFirstByProjetoIdAndPapelAndStatus(Long projetoId, PapelMembro papel, StatusConvite status);

    void deleteByProjetoId(Long projetoId);
}
