package com.tis.acaddus.model;

public class Usuario {

    private static int ULTIMO_ID;
    private int id;
    private String nome;
    private String sobrenome;
    private String email;
    private String senha;

    public int getId() {
        return id;
    }

    public Usuario(String nome, String sobrenome, String email, String senha) {

        id = ULTIMO_ID++;

        this.nome = nome;
        this.sobrenome = sobrenome;
        this.email = email;
        this.senha = senha;
    }

    public boolean login(String email, String senha) {

        return this.email.equals(email)
                && this.senha.equals(senha);
    }

    public boolean cadastro(String nome, String sobrenome,String email, String senha){
        if(nome == null || nome.isBlank()) {
            return false;
        }

        if(sobrenome == null || sobrenome.isBlank()) {
            return false;
        }

        if(email == null || !email.contains("@")) {
            return false;
        }

        if(senha == null || senha.length() < 6) {
            return false;
        }

        this.nome = nome;
        this.sobrenome = sobrenome;
        this.email = email;
        this.senha = senha;

        return true;
    }

    public String visualizarUsuario() {

        return String.format(
                "Usuário: %s %s | Email: %s",
                nome,
                sobrenome,
                email
        );
    }
}
