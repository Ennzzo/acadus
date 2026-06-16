package com.tis.acadus.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "eventos")
public class Evento {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String nome;
    
    @Column(length = 500)
    private String descricao;
    
    @Column(nullable = false)
    private LocalDate data;
    
    @Column(name = "projeto_id")
    private Long projetoId;
    
    @Column(name = "equipe_id")
    private Long equipeId;
    
    @Column(name = "responsavel_id")
    private Long responsavelId;

    @Column(length = 20)
    private String cor;
    
    @ElementCollection
    @CollectionTable(name = "evento_membros", joinColumns = @JoinColumn(name = "evento_id"))
    @Column(name = "membro_id")
    private List<Long> membrosIds;
    
    public Evento() {}
    
    public Evento(String nome, String descricao, LocalDate data, Long projetoId, Long equipeId, Long responsavelId, List<Long> membrosIds) {
        this(nome, descricao, data, projetoId, equipeId, responsavelId, membrosIds, null);
    }

    public Evento(String nome, String descricao, LocalDate data, Long projetoId, Long equipeId, Long responsavelId, List<Long> membrosIds, String cor) {
        this.nome = nome;
        this.descricao = descricao;
        this.data = data;
        this.projetoId = projetoId;
        this.equipeId = equipeId;
        this.responsavelId = responsavelId;
        this.membrosIds = membrosIds;
        this.cor = cor;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
    
    public Long getProjetoId() { return projetoId; }
    public void setProjetoId(Long projetoId) { this.projetoId = projetoId; }
    
    public Long getEquipeId() { return equipeId; }
    public void setEquipeId(Long equipeId) { this.equipeId = equipeId; }
    
    public Long getResponsavelId() { return responsavelId; }
    public void setResponsavelId(Long responsavelId) { this.responsavelId = responsavelId; }

    public String getCor() { return cor; }
    public void setCor(String cor) { this.cor = cor; }
    
    public List<Long> getMembrosIds() { return membrosIds; }
    public void setMembrosIds(List<Long> membrosIds) { this.membrosIds = membrosIds; }
}
