package com.tis.acadus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tis.acadus.entity.Tarefa;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    List<Tarefa> findByProjetoIdOrderByPrazoAscIdAsc(Long projetoId);

    void deleteByProjetoId(Long projetoId);
}
