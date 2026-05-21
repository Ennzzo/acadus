package com.tis.acadus.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EquipeResponseDTO {
    private Long projetoId;
    private String nomeProjeto;
    private String nomeEquipe;
    private List<MembroEquipeResponseDTO> membros;
}
