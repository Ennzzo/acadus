package com.tis.acadus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProjetoRequestDTO {
    @NotBlank(message = "O nome do projeto é obrigatório")
    @Size(min = 3, max = 100, message = "O nome do projeto deve ter entre 3 e 100 caracteres")
    private String nomeProjeto;

    @Size(max = 500, message = "O nome do projeto deve ter entre 3 e 100 caracteres")
    private String descricao;
}
