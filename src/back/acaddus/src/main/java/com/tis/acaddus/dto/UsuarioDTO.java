package com.tis.acaddus.dto;

public record UsuarioDTO(
        int id,
        String nome,
        String sobrenome,
        String email
) {
}