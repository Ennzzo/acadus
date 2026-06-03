package com.tis.acadus.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatContatoResponseDTO {
    private String email;
    private String nome;
    private String sobrenome;
    private String fotoUrl;
    private LocalDateTime ultimaMensagem;
    private String resumo;
    private Boolean naoVisualizada;
}
