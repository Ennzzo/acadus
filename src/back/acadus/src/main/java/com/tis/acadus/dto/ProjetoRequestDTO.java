package com.tis.acadus.dto;

import com.tis.acadus.entity.enums.StatusProjeto;
import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProjetoRequestDTO {
    @NotBlank(message = "O nome do projeto é obrigatório")
    @Size(min = 3, max = 100, message = "O nome do projeto deve ter entre 3 e 100 caracteres")
    @JsonAlias("nome")
    private String nomeProjeto;

    @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres")
    private String descricao;

    @Size(max = 150, message = "O e-mail do líder deve ter no máximo 150 caracteres")
    private String liderEmail;

    private StatusProjeto status;

    private String capaUrl;
}
