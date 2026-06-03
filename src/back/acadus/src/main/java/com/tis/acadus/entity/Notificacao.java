package com.tis.acadus.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notificacao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notificacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String destinatarioEmail;

    @Column(nullable = false, length = 40)
    private String tipo;

    @Column
    private Long referenciaId;

    @Column
    private Long projetoId;

    @Column(length = 100)
    private String projetoNome;

    @Column(length = 100)
    private String equipeNome;

    @Column(length = 150)
    private String remetenteEmail;

    @Column(length = 210)
    private String remetenteNome;

    @Column(length = 300)
    private String mensagem;

    @Column(length = 20)
    private String status;

    @Column(nullable = false, length = 120)
    private String titulo;

    @Column(nullable = false, length = 500)
    private String texto;

    @Column(nullable = false)
    private LocalDateTime dataHora;
}
