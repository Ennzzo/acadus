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
import jakarta.persistence.PostLoad;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
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

    @Column(name = "nome_projeto", nullable = false, length = 100)
    private String nomeProjeto;

    @Column(name = "nome", length = 100)
    private String nome;

    @Column(length = 500)
    private String descricao;

    @Column(nullable = false)
    @Builder.Default
    private LocalDate dataCriacao = LocalDate.now();

    public String getNome() {
        return this.nomeProjeto;
    }

    public void setNome(String nome) {
        this.nomeProjeto = nome;
        this.nome = nome;
    }

    @PostLoad
    private void normalizeNomeProjeto() {
        if ((nomeProjeto == null || nomeProjeto.isBlank()) && nome != null) {
            nomeProjeto = nome;
        }
        if ((nome == null || nome.isBlank()) && nomeProjeto != null) {
            nome = nomeProjeto;
        }
    }

    @PrePersist
    @PreUpdate
    private void syncNomeColumns() {
        if ((nomeProjeto == null || nomeProjeto.isBlank()) && nome != null) {
            nomeProjeto = nome;
        }
        nome = nomeProjeto;
    }

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
    @JoinTable(name = "projeto_usuario", joinColumns = @JoinColumn(name = "projeto_id"), inverseJoinColumns = @JoinColumn(name = "usuario_id"))
    private List<Usuario> equipe;
}
