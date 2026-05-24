package com.tis.acadus.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UsuarioProjetoResponseDTO {
    private Long id;
    private Long idUsuario;
    private String nomeUsuario;
    private Long idProjeto;
    private String nomeProjeto;
    private String papel;
}
