package com.tis.acadus.dto;

import java.time.LocalDate;

import com.tis.acadus.entity.enums.StatusProjeto;

public record ProjetoComStatusDTO(
        Long id,
        String nomeProjeto,
        String descricao,
        LocalDate dataCriacao,
        String nomeEquipe,
        String liderEmail,
        String capaUrl,
        StatusProjeto status,
        String statusUsuario) {

    public ProjetoComStatusDTO(
            Long id,
            String nomeProjeto,
            String descricao,
            LocalDate dataCriacao,
            String nomeEquipe,
            String liderEmail,
            String capaUrl,
            StatusProjeto status,
            String statusUsuario) {
        this.id = id;
        this.nomeProjeto = nomeProjeto;
        this.descricao = descricao;
        this.dataCriacao = dataCriacao;
        this.nomeEquipe = nomeEquipe;
        this.liderEmail = liderEmail;
        this.capaUrl = capaUrl;
        this.status = status;
        this.statusUsuario = statusUsuario;
    }
}
