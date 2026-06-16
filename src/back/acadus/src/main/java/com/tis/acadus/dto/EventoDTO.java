package com.tis.acadus.dto;

import java.time.LocalDate;
import java.util.List;

public record EventoDTO(
        Long id,
        String nome,
        String descricao,
        LocalDate data,
        Long projetoId,
        Long equipeId,
        Long responsavelId,
        String cor,
        List<Long> membrosIds
) {
}
