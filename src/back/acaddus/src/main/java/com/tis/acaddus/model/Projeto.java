package com.tis.acaddus.model;

import com.tis.acaddus.model.EStatusProjeto;
import com.tis.acaddus.model.Usuario;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Projeto {

    private static int ULTIMO_ID;
    private int id;
    private String nome;
    private String descricao;
    private Date dataCriacao;
    private EStatusProjeto status;
    private ArrayList<Usuario> equipe;


    public Projeto(String nome, String descricao) {

        id = ULTIMO_ID++;

        this.nome = nome;
        this.descricao = descricao;

        dataCriacao = new Date();

        status = EStatusProjeto.ATIVO;

        equipe = new ArrayList<>();
    }

    public boolean criarProjeto() {

        return nome != null
                && nome.length() >= 3
                && nome.length() <= 100;
    }

    public boolean editarProjeto(String nome, String descricao) {

        if(nome == null || nome.length() < 3 || nome.length() > 100) {
            return false;
        }

        if(descricao != null && descricao.length() > 500) {
            return false;
        }

        this.nome = nome;
        this.descricao = descricao;

        return true;
    }

    public void excluirProjeto() {

        status = EStatusProjeto.CONCLUIDO;
    }

    private Usuario localizarUsuario(int id) {

        int pos = 0;

        Usuario resposta = null;

        while(resposta == null && pos < equipe.size()) {

            Usuario membro = equipe.get(pos);

            if(membro.getId() == id) {
                resposta = membro;
            }

            pos++;
        }

        return resposta;
    }

}