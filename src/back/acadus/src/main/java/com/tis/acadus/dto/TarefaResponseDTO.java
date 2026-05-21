package com.tis.acadus.dto;

import java.time.LocalDate;

import com.tis.acadus.entity.enums.StatusTarefa;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TarefaResponseDTO {
    private Long id;
    private Long projetoId;
    private String nome;
    private String descricao;
    private String responsavel;
    private LocalDate prazo;
    private Integer progresso;
    private String comentario;
    private String checklist;
    private String anexo;
    private StatusTarefa status;
}
