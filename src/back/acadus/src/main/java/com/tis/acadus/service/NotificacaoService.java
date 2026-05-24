package com.tis.acadus.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.tis.acadus.dto.NotificacaoResponseDTO;
import com.tis.acadus.entity.MembroEquipe;
import com.tis.acadus.entity.Tarefa;
import com.tis.acadus.entity.enums.StatusConvite;
import com.tis.acadus.entity.enums.StatusTarefa;
import com.tis.acadus.repository.MembroEquipeRepository;
import com.tis.acadus.repository.TarefaRepository;

@Service
public class NotificacaoService {
    private final MembroEquipeRepository membroRepository;
    private final TarefaRepository tarefaRepository;

    public NotificacaoService(MembroEquipeRepository membroRepository, TarefaRepository tarefaRepository) {
        this.membroRepository = membroRepository;
        this.tarefaRepository = tarefaRepository;
    }

    public List<NotificacaoResponseDTO> listar(String email) {
        List<NotificacaoResponseDTO> notificacoes = new ArrayList<>();

        for (MembroEquipe membro : membroRepository.findByEmailOrderByIdDesc(email)) {
            if (membro.getStatus() == StatusConvite.PENDENTE) {
                notificacoes.add(NotificacaoResponseDTO.builder()
                        .tipo("CONVITE")
                        .referenciaId(membro.getId())
                        .projetoId(membro.getProjeto().getId())
                        .titulo("Convite para equipe")
                        .texto("Você foi convidado para " + membro.getProjeto().getNomeProjeto())
                        .build());
            }

            if (Boolean.TRUE.equals(membro.getTransferenciaPendente())) {
                notificacoes.add(NotificacaoResponseDTO.builder()
                        .tipo("LIDERANCA")
                        .referenciaId(membro.getId())
                        .projetoId(membro.getProjeto().getId())
                        .titulo("Transferência de liderança")
                        .texto("Você recebeu uma solicitação para liderar " + membro.getProjeto().getNomeProjeto())
                        .build());
            }
        }

        for (Tarefa tarefa : tarefaRepository.findByResponsavelContainingIgnoreCaseOrderByPrazoAscIdAsc(email)) {
            notificacoes.add(NotificacaoResponseDTO.builder()
                    .tipo("TAREFA")
                    .referenciaId(tarefa.getId())
                    .projetoId(tarefa.getProjeto().getId())
                    .titulo("Tarefa atribuída")
                    .texto(tarefa.getNome())
                    .build());
        }

        for (Tarefa tarefa : tarefaRepository.findAll()) {
            String liderEmail = tarefa.getProjeto().getLiderEmail();
            if (email.equalsIgnoreCase(liderEmail) && tarefa.getStatus() == StatusTarefa.EM_VALIDACAO) {
                notificacoes.add(NotificacaoResponseDTO.builder()
                        .tipo("TAREFA")
                        .referenciaId(tarefa.getId())
                        .projetoId(tarefa.getProjeto().getId())
                        .titulo("Tarefa em validação")
                        .texto(tarefa.getNome())
                        .build());
            }
        }

        return notificacoes;
    }
}
