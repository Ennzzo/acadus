package com.tis.acadus.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tis.acadus.dto.MovimentoTarefaDTO;
import com.tis.acadus.dto.QuadroColunaDTO;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.entity.QuadroColuna;
import com.tis.acadus.entity.Tarefa;
import com.tis.acadus.repository.QuadroColunaRepository;
import com.tis.acadus.repository.TarefaRepository;

@Service
public class QuadroService {
    private final QuadroColunaRepository repository;
    private final TarefaRepository tarefaRepository;
    private final ProjetoService projetoService;

    public QuadroService(
            QuadroColunaRepository repository,
            TarefaRepository tarefaRepository,
            ProjetoService projetoService) {
        this.repository = repository;
        this.tarefaRepository = tarefaRepository;
        this.projetoService = projetoService;
    }

    @Transactional
    public List<QuadroColunaDTO> listar(Long projetoId, boolean excluidas, String email) {
        projetoService.buscarProjetoDoUsuario(projetoId, email);
        migrar(projetoId);
        return repository.findByProjetoIdOrderByOrdemAscIdAsc(projetoId).stream()
                .filter(coluna -> Boolean.TRUE.equals(coluna.getExcluida()) == excluidas)
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public QuadroColuna criar(Long projetoId, String nome, String email) {
        Projeto projeto = projetoService.buscarProjetoPorId(projetoId);
        projetoService.conferirLider(projeto, email);
        migrar(projetoId);
        if (repository.findByProjetoIdOrderByOrdemAscIdAsc(projetoId).stream()
                .filter(coluna -> !Boolean.TRUE.equals(coluna.getExcluida()))
                .count() >= 10) {
            throw new RuntimeException("O quadro pode ter no máximo 10 colunas.");
        }
        if (repository.findFirstByProjetoIdAndNomeIgnoreCase(projetoId, nome.trim()).isPresent()) {
            throw new RuntimeException("Já existe uma coluna com este nome.");
        }
        int ordem = repository.findByProjetoIdOrderByOrdemAscIdAsc(projetoId).stream()
                .mapToInt(QuadroColuna::getOrdem)
                .max()
                .orElse(-1) + 1;
        return repository.save(QuadroColuna.builder()
                .projeto(projeto)
                .nome(nome.trim())
                .ordem(ordem)
                .excluida(false)
                .build());
    }

    @Transactional
    public QuadroColuna renomear(Long id, String nome, String email) {
        QuadroColuna coluna = buscar(id);
        projetoService.conferirLider(coluna.getProjeto(), email);
        repository.findFirstByProjetoIdAndNomeIgnoreCase(coluna.getProjeto().getId(), nome.trim())
                .filter(item -> !item.getId().equals(id))
                .ifPresent(item -> {
                    throw new RuntimeException("Já existe uma coluna com este nome.");
                });
        String anterior = coluna.getNome();
        coluna.setNome(nome.trim());
        tarefaRepository.findByProjetoIdAndColunaOrderByOrdemAscIdAsc(coluna.getProjeto().getId(), anterior)
                .forEach(tarefa -> tarefa.setColuna(coluna.getNome()));
        return repository.save(coluna);
    }

    @Transactional
    public void ordenar(Long projetoId, List<Long> ids, String email) {
        Projeto projeto = projetoService.buscarProjetoPorId(projetoId);
        projetoService.conferirLider(projeto, email);
        List<QuadroColuna> colunas = repository.findByProjetoIdOrderByOrdemAscIdAsc(projetoId).stream()
                .filter(coluna -> !Boolean.TRUE.equals(coluna.getExcluida()))
                .toList();
        if (ids == null || ids.size() != colunas.size()
                || !ids.containsAll(colunas.stream().map(QuadroColuna::getId).toList())) {
            throw new RuntimeException("A ordem das colunas é inválida.");
        }
        Map<Long, QuadroColuna> porId = new LinkedHashMap<>();
        colunas.forEach(coluna -> porId.put(coluna.getId(), coluna));
        for (int i = 0; i < ids.size(); i++) {
            porId.get(ids.get(i)).setOrdem(i);
        }
    }

    @Transactional
    public void excluir(Long id, String email) {
        QuadroColuna coluna = buscar(id);
        projetoService.conferirLider(coluna.getProjeto(), email);
        coluna.setExcluida(true);
        tarefaRepository.findByProjetoIdAndColunaOrderByOrdemAscIdAsc(coluna.getProjeto().getId(), coluna.getNome())
                .forEach(tarefa -> tarefa.setExcluida(true));
    }

    @Transactional
    public void restaurar(Long id, List<Long> tarefaIds, String email) {
        QuadroColuna coluna = buscar(id);
        projetoService.conferirLider(coluna.getProjeto(), email);
        coluna.setExcluida(false);
        List<Long> ids = tarefaIds == null ? List.of() : tarefaIds;
        tarefaRepository.findByProjetoIdAndColunaOrderByOrdemAscIdAsc(coluna.getProjeto().getId(), coluna.getNome())
                .stream()
                .filter(tarefa -> ids.contains(tarefa.getId()))
                .forEach(tarefa -> tarefa.setExcluida(false));
    }

    @Transactional
    public void excluirDefinitivo(Long id, String email) {
        QuadroColuna coluna = buscar(id);
        projetoService.conferirLider(coluna.getProjeto(), email);
        if (!Boolean.TRUE.equals(coluna.getExcluida())) {
            throw new RuntimeException("Envie a coluna para a lixeira antes de excluí-la.");
        }
        tarefaRepository.deleteAll(tarefaRepository.findByProjetoIdAndColunaOrderByOrdemAscIdAsc(
                coluna.getProjeto().getId(), coluna.getNome()));
        repository.delete(coluna);
    }

    @Transactional
    public Tarefa moverTarefa(Long tarefaId, MovimentoTarefaDTO dto, String email) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada."));
        projetoService.buscarProjetoDoUsuario(tarefa.getProjeto().getId(), email);
        QuadroColuna coluna = buscar(dto.getColunaId());
        if (!coluna.getProjeto().getId().equals(tarefa.getProjeto().getId())
                || Boolean.TRUE.equals(coluna.getExcluida())) {
            throw new RuntimeException("A coluna escolhida é inválida.");
        }
        List<Tarefa> destino = new ArrayList<>(tarefaRepository.findByProjetoIdAndColunaOrderByOrdemAscIdAsc(
                tarefa.getProjeto().getId(), coluna.getNome()).stream()
                .filter(item -> !Boolean.TRUE.equals(item.getExcluida()) && !item.getId().equals(tarefaId))
                .toList());
        int posicao = dto.getPosicao() == null ? destino.size() : Math.max(0, Math.min(dto.getPosicao(), destino.size()));
        tarefa.setColuna(coluna.getNome());
        tarefa.setOrdem(posicao);
        destino.add(posicao, tarefa);
        for (int i = 0; i < destino.size(); i++) {
            destino.get(i).setOrdem(i);
        }
        return tarefaRepository.save(tarefa);
    }

    @Transactional
    public QuadroColuna buscarOuCriar(Long projetoId, String nome) {
        migrar(projetoId);
        return repository.findFirstByProjetoIdAndNomeIgnoreCase(projetoId, nome)
                .orElseThrow(() -> new RuntimeException("Coluna não encontrada."));
    }

    @Transactional
    public synchronized void migrar(Long projetoId) {
        Projeto projeto = projetoService.buscarProjetoPorId(projetoId);
        List<Tarefa> tarefas = tarefaRepository.findByProjetoIdOrderByPrazoAscIdAsc(projetoId);
        Map<String, List<Tarefa>> porNome = new LinkedHashMap<>();
        for (Tarefa tarefa : tarefas) {
            String nome = tarefa.getColuna() == null || tarefa.getColuna().isBlank() ? "A fazer" : tarefa.getColuna();
            tarefa.setColuna(nome);
            porNome.computeIfAbsent(nome, chave -> new ArrayList<>()).add(tarefa);
        }
        int ordem = repository.findByProjetoIdOrderByOrdemAscIdAsc(projetoId).stream()
                .mapToInt(QuadroColuna::getOrdem)
                .max()
                .orElse(-1) + 1;
        for (Map.Entry<String, List<Tarefa>> item : porNome.entrySet()) {
            if (repository.findFirstByProjetoIdAndNomeIgnoreCase(projetoId, item.getKey()).isEmpty()) {
                boolean excluida = item.getValue().stream().allMatch(tarefa -> Boolean.TRUE.equals(tarefa.getExcluida()));
                repository.save(QuadroColuna.builder()
                        .projeto(projeto)
                        .nome(item.getKey())
                        .ordem(ordem++)
                        .excluida(excluida)
                        .build());
            }
            List<Tarefa> tarefasDaColuna = item.getValue();
            for (int i = 0; i < tarefasDaColuna.size(); i++) {
                if (tarefasDaColuna.get(i).getOrdem() == null) tarefasDaColuna.get(i).setOrdem(i);
            }
        }
    }

    public QuadroColuna buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coluna não encontrada."));
    }

    public QuadroColunaDTO toDto(QuadroColuna coluna) {
        return QuadroColunaDTO.builder()
                .id(coluna.getId())
                .nome(coluna.getNome())
                .ordem(coluna.getOrdem())
                .excluida(coluna.getExcluida())
                .tarefas(List.of())
                .build();
    }
}
