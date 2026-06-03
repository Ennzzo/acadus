package com.tis.acadus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EquipeRequestDTO {
    @NotBlank(message = "Informe o nome da equipe.")
    @Size(min = 3, max = 100, message = "O nome da equipe deve ter entre 3 e 100 caracteres.")
    private String nomeEquipe;
}
