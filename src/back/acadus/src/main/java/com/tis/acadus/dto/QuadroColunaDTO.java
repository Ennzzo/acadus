package com.tis.acadus.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuadroColunaDTO {
    private Long id;
    private String nome;
    private Integer ordem;
    private Boolean excluida;
    private List<TarefaResponseDTO> tarefas;
}
