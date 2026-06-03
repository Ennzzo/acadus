package com.tis.acadus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MembroEquipeRequestDTO {
    @NotBlank(message = "Informe o e-mail do membro.")
    @Email(message = "Informe um e-mail válido.")
    @Size(max = 150, message = "O e-mail deve ter no máximo 150 caracteres.")
    private String email;

    @Size(max = 300, message = "A mensagem deve ter no máximo 300 caracteres.")
    private String mensagem;
}
