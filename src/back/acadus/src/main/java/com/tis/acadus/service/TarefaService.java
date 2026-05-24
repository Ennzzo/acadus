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
        return repository.findByProjetoIdOrderByPrazoAscIdAsc(projetoId).stream()
                .filter(tarefa -> !Boolean.TRUE.equals(tarefa.getExcluida()))
                .toList();
    }

    public List<Tarefa> listarLixeira(Long projetoId) {
        return repository.findByProjetoIdOrderByPrazoAscIdAsc(projetoId).stream()
                .filter(tarefa -> Boolean.TRUE.equals(tarefa.getExcluida()))
                .toList();
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
                .coluna(dto.getColuna() == null || dto.getColuna().isBlank() ? "A fazer" : dto.getColuna())
                .excluida(false)
                .prazo(dto.getPrazo())
                .horaPrazo(dto.getHoraPrazo())
                .progresso(calcularProgresso(dto.getChecklist()))
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
        tarefa.setColuna(dto.getColuna() == null ? tarefa.getColuna() : dto.getColuna());
        tarefa.setExcluida(dto.getExcluida() == null ? tarefa.getExcluida() : dto.getExcluida());
        tarefa.setPrazo(dto.getPrazo());
        tarefa.setHoraPrazo(dto.getHoraPrazo());
        tarefa.setProgresso(calcularProgresso(dto.getChecklist()));
        tarefa.setComentario(dto.getComentario());
        tarefa.setChecklist(dto.getChecklist());
        tarefa.setAnexo(dto.getAnexo());
        tarefa.setStatus(dto.getStatus() == null ? tarefa.getStatus() : dto.getStatus());

        return repository.save(tarefa);
    }

    public void excluir(Long id) {
        Tarefa tarefa = buscarPorId(id);
        tarefa.setExcluida(true);
        repository.save(tarefa);
    }

    public void excluirDefinitivo(Long id) {
        repository.delete(buscarPorId(id));
    }

    public TarefaResponseDTO toDto(Tarefa tarefa) {
        return TarefaResponseDTO.builder()
                .id(tarefa.getId())
                .projetoId(tarefa.getProjeto().getId())
                .nome(tarefa.getNome())
                .descricao(tarefa.getDescricao())
                .responsavel(tarefa.getResponsavel())
                .coluna(tarefa.getColuna())
                .excluida(Boolean.TRUE.equals(tarefa.getExcluida()))
                .prazo(tarefa.getPrazo())
                .horaPrazo(tarefa.getHoraPrazo())
                .progresso(tarefa.getProgresso())
                .comentario(tarefa.getComentario())
                .checklist(tarefa.getChecklist())
                .anexo(tarefa.getAnexo())
                .status(tarefa.getStatus())
                .build();
    }

    private int calcularProgresso(String checklist) {
        if (checklist == null || checklist.isBlank()) {
            return 0;
        }

        String[] itens = checklist.lines()
                .filter(item -> !item.isBlank())
                .toArray(String[]::new);

        if (itens.length == 0) {
            return 0;
        }

        long feitos = java.util.Arrays.stream(itens)
                .filter(item -> item.trim().startsWith("[x]"))
                .count();

        return (int) Math.round((feitos * 100.0) / itens.length);
    }
}
