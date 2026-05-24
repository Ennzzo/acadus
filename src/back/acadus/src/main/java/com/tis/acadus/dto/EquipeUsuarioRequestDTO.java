package com.tis.acadus.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EquipeUsuarioRequestDTO {
    @NotNull(message = "A equipe é obrigatória")
    private Long idEquipe;

    @NotNull(message = "O usuário é obrigatório")
    private Long idUsuario;
}
