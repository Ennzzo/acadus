package com.tis.acadus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioRequestDTO {
    @NotBlank(message = "Informe o nome.")
    @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
    private String nome;

    @NotBlank(message = "Informe o sobrenome.")
    @Size(max = 100, message = "O sobrenome deve ter no máximo 100 caracteres.")
    private String sobrenome;

    @NotBlank(message = "Informe o e-mail.")
    @Email(message = "Informe um e-mail válido.")
    @Size(max = 150, message = "O e-mail deve ter no máximo 150 caracteres.")
    private String email;

    @NotBlank(message = "Informe a senha.")
    @Size(min = 6, max = 255, message = "A senha deve ter pelo menos 6 caracteres.")
    private String senha;
}
