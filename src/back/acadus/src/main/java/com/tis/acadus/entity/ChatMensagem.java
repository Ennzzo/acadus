package com.tis.acadus.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "chat_mensagem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMensagem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String autorEmail;

    @Column(length = 150)
    private String autorNome;

    @Column(nullable = false, length = 30)
    private String tipoChat;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String conteudo;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String anexo;

    @Column
    private Boolean editada;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String conteudoAnterior;

    @Column
    private Boolean excluida;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projeto_id", nullable = false)
    private Projeto projeto;
}
