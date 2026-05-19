package com.tis.acaddus.model;

import com.tis.acaddus.dto.MembroEquipeDTO;
import com.tis.acaddus.model.EPapelEquipe;

public class MembroEquipe {

    private static int ULTIMO_ID;

    private int id;
    private Usuario usuario;
    private EPapelEquipe papel;

    public MembroEquipe(Usuario usuario, EPapelEquipe papel) {

        id = ++ULTIMO_ID;

        this.usuario = usuario;
        this.papel = papel;
    }

    public int getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public EPapelEquipe getPapel() {
        return papel;
    }

    public void alterarPapel(EPapelEquipe papel) {

        if(papel != null) {
            this.papel = papel;
        }
    }

    public MembroEquipeDTO dto() {

        return new MembroEquipeDTO(
                id,
                usuario.getId(),
                usuario.getNome(),
                papel
        );
    }
}