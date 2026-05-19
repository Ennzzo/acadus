package com.tis.acadus.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsuarioResponseDTO {
    private Long id;
    private String nome;
    private String sobrenome;
    private String email;
}
