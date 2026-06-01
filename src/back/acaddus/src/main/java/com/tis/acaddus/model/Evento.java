package com.tis.acaddus.model;

import com.tis.acaddus.dto.EventoDTO;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Evento {

    private static int ULTIMO_ID;
    private int id;
    private String nome;
    private String descricao;
    private Date data;
    private Integer projetoId;
    private List<Integer> membrosIds;

    public int getId() { return id; }

    public String getNome() { return nome; }

    public String getDescricao() { return descricao; }

    public Date getData() { return data; }

    public Integer getProjetoId() { return projetoId; }

    public List<Integer> getMembrosIds() { return membrosIds; }

    public Evento(String nome, String descricao, Date data, Integer projetoId, List<Integer> membrosIds) {
        this.id = ULTIMO_ID++;
        this.nome = nome;
        this.descricao = descricao;
        this.data = data;
        this.projetoId = projetoId;
        this.membrosIds = membrosIds != null ? new ArrayList<>(membrosIds) : new ArrayList<>();
    }

    public boolean criarEvento() {
        return nome != null
                && nome.length() >= 1
                && nome.length() <= 100
                && data != null;
    }

    public boolean editarEvento(String nome, String descricao, Date data, Integer projetoId, List<Integer> membrosIds) {
        if (nome == null || nome.isEmpty() || nome.length() > 100) {
            return false;
        }

        if (data == null) {
            return false;
        }

        if (descricao != null && descricao.length() > 500) {
            return false;
        }

        this.nome = nome;
        this.descricao = descricao;
        this.data = data;
        this.projetoId = projetoId;
        this.membrosIds = membrosIds != null ? new ArrayList<>(membrosIds) : new ArrayList<>();

        return true;
    }

    public EventoDTO dto() {
        return new EventoDTO(
                id,
                nome,
                descricao,
                data,
                projetoId,
                membrosIds
        );
    }
}
