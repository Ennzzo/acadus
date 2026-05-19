package com.tis.acaddus.model;

import com.tis.acaddus.dto.ConviteEquipeDTO;
import com.tis.acaddus.model.EPapelEquipe;
import com.tis.acaddus.model.EStatusConvite;

import java.util.Date;

public class ConviteEquipe {

    private static int ULTIMO_ID;

    private int id;
    private String emailConvidado;
    private String mensagem;
    private EPapelEquipe papelSugerido;
    private EStatusConvite status;
    private Date dataEnvio;

    public ConviteEquipe(String emailConvidado,
                         String mensagem,
                         EPapelEquipe papelSugerido) {

        id = ++ULTIMO_ID;

        this.emailConvidado = emailConvidado;
        this.mensagem = mensagem;
        this.papelSugerido = papelSugerido;

        status = EStatusConvite.PENDENTE;
        dataEnvio = new Date();
    }

    public boolean aceitarConvite() {

        if(status != EStatusConvite.PENDENTE) {
            return false;
        }

        status = EStatusConvite.ACEITO;

        return true;
    }

    public boolean recusarConvite() {

        if(status != EStatusConvite.PENDENTE) {
            return false;
        }

        status = EStatusConvite.RECUSADO;

        return true;
    }

    public String getEmailConvidado() {
        return emailConvidado;
    }

    public EPapelEquipe getPapelSugerido() {
        return papelSugerido;
    }

    public EStatusConvite getStatus() {
        return status;
    }

    public Date getDataEnvio() {
        return dataEnvio;
    }

    public ConviteEquipeDTO dto() {

        return new ConviteEquipeDTO(
                id,
                emailConvidado,
                status,
                dataEnvio
        );
    }
}