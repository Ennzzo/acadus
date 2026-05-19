package com.tis.acaddus.dto;

import com.tis.acaddus.model.EPapelEquipe;

public record MembroEquipeDTO(
        int id,
        int usuarioId,
        String nomeUsuario,
        EPapelEquipe papel
) {
}