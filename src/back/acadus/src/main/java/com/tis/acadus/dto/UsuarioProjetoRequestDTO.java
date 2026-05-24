package com.tis.acadus.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UsuarioProjetoRequestDTO {
    private Long idUsuario;
    private Long idProjeto;
    private String papel;
}
