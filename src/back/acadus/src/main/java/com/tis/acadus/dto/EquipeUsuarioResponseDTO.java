package com.tis.acadus.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EquipeUsuarioResponseDTO {
    private Long id;
    private Long idEquipe;
    private String nomeEquipe;
    private Long idUsuario;
    private String nomeUsuario;
}
