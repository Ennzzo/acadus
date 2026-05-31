package com.tis.acadus.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificacaoResponseDTO {
    private String tipo;
    private Long referenciaId;
    private Long projetoId;
    private String projetoNome;
    private String equipeNome;
    private String remetenteEmail;
    private String remetenteNome;
    private LocalDateTime dataHora;
    private String mensagem;
    private String status;
    private String titulo;
    private String texto;
}
