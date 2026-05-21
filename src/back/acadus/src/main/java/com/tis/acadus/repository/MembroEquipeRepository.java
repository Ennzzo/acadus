package com.tis.acadus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tis.acadus.entity.MembroEquipe;

public interface MembroEquipeRepository extends JpaRepository<MembroEquipe, Long> {
    List<MembroEquipe> findByProjetoIdOrderByIdAsc(Long projetoId);

    void deleteByProjetoId(Long projetoId);
}
