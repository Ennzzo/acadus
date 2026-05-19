package com.tis.acadus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UsuarioRequestDTO {
    @NotBlank
    private String nome;

    @NotBlank
    private String sobrenome;

    @Email
    private String email;

    @NotBlank
    private String senha;
}
