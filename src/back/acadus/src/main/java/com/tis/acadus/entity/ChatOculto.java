package com.tis.acadus.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "chat_oculto",
        uniqueConstraints = @UniqueConstraint(columnNames = { "usuario_email", "tipo_chat" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatOculto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_email", nullable = false, length = 150)
    private String usuarioEmail;

    @Column(name = "tipo_chat", nullable = false, length = 340)
    private String tipoChat;

    @Column(nullable = false)
    private LocalDateTime ocultoAte;
}
