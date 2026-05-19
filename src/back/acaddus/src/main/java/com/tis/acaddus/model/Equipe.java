package com.tis.acaddus.model;

import com.tis.acaddus.dto.EquipeDTO;
import com.tis.acaddus.model.EPapelEquipe;
import com.tis.acaddus.model.EStatusEquipe;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Equipe {

    private static int ULTIMO_ID;

    private int id;
    private String nome;
    private Projeto projeto;
    private Date dataCriacao;
    private EStatusEquipe status;

    private List<MembroEquipe> membros;
    private List<ConviteEquipe> convites;

    public Equipe(String nome, Projeto projeto) {

        id = ++ULTIMO_ID;

        this.nome = nome;
        this.projeto = projeto;

        dataCriacao = new Date();

        status = EStatusEquipe.ATIVA;

        membros = new ArrayList<>();
        convites = new ArrayList<>();
    }

    public int getId() {
        return id;
    }

    public List<MembroEquipe> getMembros() {
        return membros;
    }

    public List<ConviteEquipe> getConvites() {
        return convites;
    }

    public boolean criarEquipe() {

        return nome != null
                && nome.length() >= 3
                && nome.length() <= 100
                && projeto != null;
    }

    public boolean editarEquipe(String nome) {

        if(nome == null || nome.length() < 3 || nome.length() > 100) {
            return false;
        }

        this.nome = nome;

        return true;
    }

    public boolean convidarMembro(String email,
                                  String mensagem,
                                  EPapelEquipe papel) {

        if(email == null || !email.contains("@")) {
            return false;
        }

        ConviteEquipe convite = new ConviteEquipe(
                email,
                mensagem,
                papel
        );

        convites.add(convite);

        return true;
    }

    public boolean adicionarMembro(Usuario usuario,
                                   EPapelEquipe papel) {

        if(usuario == null) {
            return false;
        }

        if(localizarMembro(usuario.getId()) != null) {
            return false;
        }

        membros.add(new MembroEquipe(usuario, papel));

        return true;
    }

    public boolean removerMembro(int usuarioId) {

        MembroEquipe membro = localizarMembro(usuarioId);

        if(membro == null) {
            return false;
        }

        membros.remove(membro);

        if(membros.isEmpty()) {
            excluirEquipe();
        }

        return true;
    }

    public void excluirEquipe() {

        status = EStatusEquipe.EXCLUIDA;
    }

    private MembroEquipe localizarMembro(int usuarioId) {

        int pos = 0;

        MembroEquipe resposta = null;

        while(resposta == null && pos < membros.size()) {

            MembroEquipe membro = membros.get(pos);

            if(membro.getUsuario().getId() == usuarioId) {
                resposta = membro;
            }

            pos++;
        }

        return resposta;
    }

    public EquipeDTO dto() {

        return new EquipeDTO(
                id,
                nome,
                projeto.getId(),
                dataCriacao,
                status
        );
    }
}