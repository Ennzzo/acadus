package com.tis.acadus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tis.acadus.entity.Tarefa;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    List<Tarefa> findByProjetoIdOrderByPrazoAscIdAsc(Long projetoId);

    List<Tarefa> findByProjetoIdAndExcluidaFalseOrderByIdAsc(Long projetoId);

    List<Tarefa> findByProjetoIdAndExcluidaTrueOrderByIdAsc(Long projetoId);

    List<Tarefa> findByProjetoIdAndColunaOrderByOrdemAscIdAsc(Long projetoId, String coluna);

    List<Tarefa> findByResponsavelContainingIgnoreCaseOrderByPrazoAscIdAsc(String responsavel);

    void deleteByProjetoId(Long projetoId);
}
