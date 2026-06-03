package com.tis.acadus.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RemocaoMembroRequestDTO {
    @Size(max = 300, message = "A mensagem deve ter no máximo 300 caracteres.")
    private String mensagem;
}
