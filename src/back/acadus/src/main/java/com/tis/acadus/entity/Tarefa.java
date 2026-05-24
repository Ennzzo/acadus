package com.tis.acadus.entity;

import java.time.LocalDate;

import com.tis.acadus.entity.enums.StatusTarefa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tarefa")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tarefa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(length = 500)
    private String descricao;

    @Column(length = 1000)
    private String responsavel;

    @Column(length = 80)
    private String coluna;

    @Column
    private Boolean excluida;

    private LocalDate prazo;

    @Column(length = 5)
    private String horaPrazo;

    @Column(nullable = false)
    private Integer progresso;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String comentario;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String checklist;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String anexo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusTarefa status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projeto_id", nullable = false)
    private Projeto projeto;
}
