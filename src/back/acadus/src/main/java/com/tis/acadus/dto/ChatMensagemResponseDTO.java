package com.tis.acadus.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatMensagemResponseDTO {
    private Long id;
    private Long projetoId;
    private String autorEmail;
    private String autorNome;
    private String tipoChat;
    private String conteudo;
    private String anexo;
    private Boolean editada;
    private String conteudoAnterior;
    private Boolean excluida;
    private LocalDateTime dataHora;
}
