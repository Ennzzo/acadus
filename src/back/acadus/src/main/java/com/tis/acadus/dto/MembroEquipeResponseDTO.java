package com.tis.acadus.dto;

import java.time.LocalDate;

import com.tis.acadus.entity.enums.PapelMembro;
import com.tis.acadus.entity.enums.StatusConvite;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MembroEquipeResponseDTO {
    private Long id;
    private Long projetoId;
    private String email;
    private PapelMembro papel;
    private String mensagem;
    private StatusConvite status;
    private LocalDate dataConvite;
}
