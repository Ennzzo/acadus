package com.tis.acadus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PerfilRequestDTO {
    @NotBlank(message = "Informe o nome.")
    @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
    private String nome;

    @NotBlank(message = "Informe o sobrenome.")
    @Size(max = 100, message = "O sobrenome deve ter no máximo 100 caracteres.")
    private String sobrenome;

    @Size(min = 6, max = 255, message = "A senha deve ter pelo menos 6 caracteres.")
    private String novaSenha;

    @Size(max = 1400000, message = "A imagem deve ter no máximo 1 MB.")
    private String fotoUrl;
}
