package com.tis.acadus.dto;

import java.time.LocalDate;

import com.tis.acadus.entity.enums.StatusTarefa;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TarefaRequestDTO {
    @NotBlank(message = "O nome da tarefa é obrigatório")
    @Size(min = 3, max = 100, message = "O nome deve ter entre 3 e 100 caracteres")
    private String nome;

    @Size(max = 800, message = "A descrição deve ter no máximo 800 caracteres")
    private String descricao;

    @Size(max = 1000, message = "O responsável deve ter no máximo 1000 caracteres")
    private String responsavel;

    @Size(max = 80, message = "A coluna deve ter no máximo 80 caracteres")
    private String coluna;

    private Boolean excluida;

    private LocalDate prazo;

    @Size(max = 5, message = "A hora deve ter no máximo 5 caracteres")
    private String horaPrazo;

    @Min(value = 0, message = "O progresso mínimo é 0")
    @Max(value = 100, message = "O progresso máximo é 100")
    private Integer progresso;

    @Size(max = 5000, message = "O comentário deve ter no máximo 5000 caracteres")
    private String comentario;

    @Size(max = 5000, message = "O checklist deve ter no máximo 5000 caracteres")
    private String checklist;

    @Size(max = 20000000, message = "Os anexos estão muito grandes")
    private String anexo;

    private StatusTarefa status;
}
