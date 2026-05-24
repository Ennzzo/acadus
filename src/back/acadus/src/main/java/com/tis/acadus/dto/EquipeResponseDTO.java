package com.tis.acadus.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EquipeResponseDTO {
    private Long id;
    private String nome;

    private Long idProjeto;
    private String nomeProjeto;
}
