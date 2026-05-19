package com.tis.acaddus.dto;

import com.tis.acaddus.model.EStatusEquipe;

import java.util.Date;

public record EquipeDTO(
        int id,
        String nome,
        int projetoId,
        Date dataCriacao,
        EStatusEquipe status
) {
}