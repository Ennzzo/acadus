package com.tis.acadus.dto;

import java.time.LocalDate;

import com.tis.acadus.entity.enums.StatusProjeto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjetoResponseDTO {
    private Long id;
    private String nomeProjeto;
    private String descricao;
    private LocalDate dataCriacao;
    private StatusProjeto status;
}
