package com.tis.acaddus.dto;

import java.util.Date;
import java.util.List;

public record EventoDTO(
        int id,
        String nome,
        String descricao,
        Date data,
        Integer projetoId,
        List<Integer> membrosIds
) {
}
