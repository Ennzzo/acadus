package com.tis.acadus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequestDTO {
    @NotBlank(message = "Informe o e-mail.")
    private String email;

    @NotBlank(message = "Informe a senha.")
    private String senha;
}
