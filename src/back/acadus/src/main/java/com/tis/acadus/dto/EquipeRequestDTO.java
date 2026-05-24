package com.tis.acadus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EquipeRequestDTO {
    @NotBlank(message = "O nome da equipe é obrigatório")
    private String nome;

    @NotNull(message = "A equipe deve estar vinculada a um projeto")
    private Long idProjeto;
}
