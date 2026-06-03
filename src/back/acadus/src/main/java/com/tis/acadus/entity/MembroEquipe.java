package com.tis.acadus.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.tis.acadus.entity.enums.PapelMembro;
import com.tis.acadus.entity.enums.StatusConvite;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "membro_equipe")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembroEquipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PapelMembro papel;

    @Column(length = 300)
    private String mensagem;

    @Column(length = 150)
    private String convidadoPor;

    @Column
    private Boolean transferenciaPendente;

    @Enumerated(EnumType.STRING)
    @Column
    private StatusConvite statusTransferencia;

    @Column
    private Boolean bloqueado;

    @Column(length = 300)
    private String motivoBloqueio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusConvite status;

    @Column(nullable = false)
    private LocalDate dataConvite;

    @Column
    private LocalDateTime dataEntrada;

    @Column
    private LocalDateTime dataSaida;

    @Column
    private Boolean removido;

    @Column
    private Boolean ocultoLista;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projeto_id", nullable = false)
    private Projeto projeto;
}
