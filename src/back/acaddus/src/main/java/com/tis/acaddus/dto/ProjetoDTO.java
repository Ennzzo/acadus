package com.tis.acaddus.dto;

import com.tis.acaddus.model.EStatusProjeto;

import java.util.Date;

public record ProjetoDTO(
        int id,
        String nome,
        String descricao,
        Date dataCriacao,
        EStatusProjeto status
) {
}