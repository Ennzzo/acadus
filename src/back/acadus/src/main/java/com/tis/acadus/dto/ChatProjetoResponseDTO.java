package com.tis.acadus.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatProjetoResponseDTO {
    private Long id;
    private String nomeProjeto;
    private String liderEmail;
    private String statusMembro;
    private LocalDateTime dataSaida;
    private LocalDateTime ultimaMensagem;
    private String resumo;
    private Boolean naoVisualizada;
    private LocalDateTime visivelDesde;
}
