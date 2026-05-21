package com.tis.acadus.dto;

import com.tis.acadus.entity.enums.StatusConvite;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MembroStatusRequestDTO {
    @NotNull(message = "Informe o status do convite.")
    private StatusConvite status;
}
