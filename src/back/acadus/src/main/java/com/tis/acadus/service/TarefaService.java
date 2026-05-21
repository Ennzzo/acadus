package com.tis.acadus.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tis.acadus.dto.TarefaRequestDTO;
import com.tis.acadus.dto.TarefaResponseDTO;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.entity.Tarefa;
import com.tis.acadus.entity.enums.StatusTarefa;
import com.tis.acadus.repository.TarefaRepository;

@Service
public class TarefaService {
    private final TarefaRepository repository;
    private final ProjetoService projetoService;

    public TarefaService(TarefaRepository repository, ProjetoService projetoService) {
        this.repository = repository;
        this.projetoService = projetoService;
    }

    public List<Tarefa> listarPorProjeto(Long projetoId) {
        return repository.findByProjetoIdOrderByPrazoAscIdAsc(projetoId);
    }

    public Tarefa buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada."));
    }

    public Tarefa criar(Long projetoId, TarefaRequestDTO dto) {
        Projeto projeto = projetoService.buscarProjetoPorId(projetoId);

        Tarefa tarefa = Tarefa.builder()
                .projeto(projeto)
                .nome(dto.getNome())
                .descricao(dto.getDescricao())
                .responsavel(dto.getResponsavel())
                .prazo(dto.getPrazo())
                .progresso(dto.getProgresso() == null ? 0 : dto.getProgresso())
                .comentario(dto.getComentario())
                .checklist(dto.getChecklist())
                .anexo(dto.getAnexo())
                .status(dto.getStatus() == null ? StatusTarefa.PENDENTE : dto.getStatus())
                .build();

        return repository.save(tarefa);
    }

    public Tarefa editar(Long id, TarefaRequestDTO dto) {
        Tarefa tarefa = buscarPorId(id);

        tarefa.setNome(dto.getNome());
        tarefa.setDescricao(dto.getDescricao());
        tarefa.setResponsavel(dto.getResponsavel());
        tarefa.setPrazo(dto.getPrazo());
        tarefa.setProgresso(dto.getProgresso() == null ? tarefa.getProgresso() : dto.getProgresso());
        tarefa.setComentario(dto.getComentario());
        tarefa.setChecklist(dto.getChecklist());
        tarefa.setAnexo(dto.getAnexo());
        tarefa.setStatus(dto.getStatus() == null ? tarefa.getStatus() : dto.getStatus());

        return repository.save(tarefa);
    }

    public void excluir(Long id) {
        repository.delete(buscarPorId(id));
    }

    public TarefaResponseDTO toDto(Tarefa tarefa) {
        return TarefaResponseDTO.builder()
                .id(tarefa.getId())
                .projetoId(tarefa.getProjeto().getId())
                .nome(tarefa.getNome())
                .descricao(tarefa.getDescricao())
                .responsavel(tarefa.getResponsavel())
                .prazo(tarefa.getPrazo())
                .progresso(tarefa.getProgresso())
                .comentario(tarefa.getComentario())
                .checklist(tarefa.getChecklist())
                .anexo(tarefa.getAnexo())
                .status(tarefa.getStatus())
                .build();
    }
}
