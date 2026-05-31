package com.tis.acadus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ColunaRequestDTO {
    @NotBlank(message = "Informe o nome da coluna.")
    @Size(max = 80, message = "O nome da coluna deve ter no máximo 80 caracteres.")
    private String nome;
}
