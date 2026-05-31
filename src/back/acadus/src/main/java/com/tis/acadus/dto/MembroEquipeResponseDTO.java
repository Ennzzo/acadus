package com.tis.acadus.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
    private String nome;
    private String sobrenome;
    private String fotoUrl;
    private PapelMembro papel;
    private String mensagem;
    private String convidadoPor;
    private Boolean transferenciaPendente;
    private StatusConvite statusTransferencia;
    private Boolean bloqueado;
    private String motivoBloqueio;
    private StatusConvite status;
    private LocalDate dataConvite;
    private LocalDateTime dataEntrada;
    private LocalDateTime dataSaida;
    private Boolean removido;
    private Boolean ocultoLista;
}
