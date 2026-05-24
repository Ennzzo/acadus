package com.tis.acadus.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificacaoResponseDTO {
    private String tipo;
    private Long referenciaId;
    private Long projetoId;
    private String titulo;
    private String texto;
}
