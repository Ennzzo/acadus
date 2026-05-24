package com.tis.acadus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UsuarioProjetoRequestDTO {
    @NotNull(message = "O usuário é obrigatório")
    private Long idUsuario;

    @NotNull(message = "O projeto é obrigatório")
    private Long idProjeto;

    @NotBlank(message = "O papel do usuário no projeto é obrigatório")
    private String papel;
}
