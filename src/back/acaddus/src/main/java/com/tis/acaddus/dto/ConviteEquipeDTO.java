package com.tis.acaddus.dto;


import com.tis.acaddus.model.EStatusConvite;

import java.util.Date;

public record ConviteEquipeDTO(
        int id,
        String emailConvidado,
        EStatusConvite status,
        Date dataEnvio
) {
}