package com.tis.acadus.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BloqueioMembroRequestDTO {
    private Boolean bloqueado;

    @Size(max = 300, message = "O motivo deve ter no máximo 300 caracteres.")
    private String motivo;
}
