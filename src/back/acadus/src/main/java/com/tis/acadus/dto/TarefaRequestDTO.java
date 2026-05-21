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

    @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres")
    private String descricao;

    @Size(max = 100, message = "O responsável deve ter no máximo 100 caracteres")
    private String responsavel;

    private LocalDate prazo;

    @Min(value = 0, message = "O progresso mínimo é 0")
    @Max(value = 100, message = "O progresso máximo é 100")
    private Integer progresso;

    @Size(max = 300, message = "O comentário deve ter no máximo 300 caracteres")
    private String comentario;

    @Size(max = 1000, message = "O checklist deve ter no máximo 1000 caracteres")
    private String checklist;

    @Size(max = 150, message = "O nome do anexo deve ter no máximo 150 caracteres")
    private String anexo;

    private StatusTarefa status;
}
