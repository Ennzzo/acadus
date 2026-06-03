package com.tis.acadus.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tis.acadus.entity.QuadroColuna;

public interface QuadroColunaRepository extends JpaRepository<QuadroColuna, Long> {
    List<QuadroColuna> findByProjetoIdOrderByOrdemAscIdAsc(Long projetoId);

    Optional<QuadroColuna> findFirstByProjetoIdAndNomeIgnoreCase(Long projetoId, String nome);

    void deleteByProjetoId(Long projetoId);
}
