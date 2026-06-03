package com.tis.acadus.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MovimentoTarefaDTO {
    @NotNull
    private Long colunaId;

    private Integer posicao;
}
