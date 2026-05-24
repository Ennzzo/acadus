package com.tis.acadus.entity;

import java.time.LocalDate;
import java.util.List;

import com.tis.acadus.entity.enums.StatusProjeto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "projeto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Projeto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nomeProjeto;

    @Column(length = 500)
    private String descricao;

    @Column(nullable = false)
    private LocalDate dataCriacao;

    @Column(length = 100)
    private String nomeEquipe;

    @Column(length = 150)
    private String liderEmail;

    @Lob
    @Column(columnDefinition = "MEDIUMTEXT")
    private String capaUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusProjeto status;

    @ManyToMany
    @JoinTable(
        name = "projeto_usuario",
        joinColumns = @JoinColumn(name = "projeto_id"),
        inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    private List<Usuario> equipe;
}
