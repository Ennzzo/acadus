package com.tis.acadus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChatMensagemRequestDTO {
    @NotBlank(message = "Informe o conteúdo da mensagem.")
    @Size(max = 1000, message = "A mensagem deve ter no máximo 1000 caracteres.")
    private String conteudo;

    @Size(max = 20000000, message = "O anexo está muito grande.")
    private String anexo;

    @NotBlank(message = "Informe o e-mail do usuário.")
    private String autorEmail;

    private String autorNome;

    private String tipoChat;
}
