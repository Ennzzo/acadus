package com.tis.acadus.repository;

import com.tis.acadus.entity.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {
    
    @Query(value = "SELECT * FROM eventos WHERE YEAR(data) = :ano AND MONTH(data) = :mes", nativeQuery = true)
    List<Evento> findByMes(@Param("ano") int ano, @Param("mes") int mes);
    
    @Query(value = "SELECT * FROM eventos WHERE equipe_id = :equipeId AND YEAR(data) = :ano AND MONTH(data) = :mes", nativeQuery = true)
    List<Evento> findByEquipeAndMes(@Param("equipeId") Long equipeId, @Param("ano") int ano, @Param("mes") int mes);
    
    @Query(value = "SELECT * FROM eventos WHERE projeto_id = :projetoId AND YEAR(data) = :ano AND MONTH(data) = :mes", nativeQuery = true)
    List<Evento> findByProjetoAndMes(@Param("projetoId") Long projetoId, @Param("ano") int ano, @Param("mes") int mes);
    
    List<Evento> findByProjetoId(Long projetoId);
    
    List<Evento> findByEquipeId(Long equipeId);
}
