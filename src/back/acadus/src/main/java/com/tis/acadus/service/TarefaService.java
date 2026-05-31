package com.tis.acadus.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.Arrays;

import org.springframework.stereotype.Service;

import com.tis.acadus.dto.TarefaRequestDTO;
import com.tis.acadus.dto.TarefaResponseDTO;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.entity.Tarefa;
import com.tis.acadus.entity.enums.StatusTarefa;
import com.tis.acadus.entity.enums.StatusConvite;
import com.tis.acadus.repository.MembroEquipeRepository;
import com.tis.acadus.repository.QuadroColunaRepository;
import com.tis.acadus.repository.TarefaRepository;

@Service
public class TarefaService {
    private final TarefaRepository repository;
    private final ProjetoService projetoService;
    private final NotificacaoService notificacaoService;
    private final MembroEquipeRepository membroRepository;
    private final QuadroColunaRepository colunaRepository;
    private final QuadroService quadroService;

    public TarefaService(
            TarefaRepository repository,
            ProjetoService projetoService,
            NotificacaoService notificacaoService,
            MembroEquipeRepository membroRepository,
            QuadroColunaRepository colunaRepository,
            QuadroService quadroService) {
        this.repository = repository;
        this.projetoService = projetoService;
        this.notificacaoService = notificacaoService;
        this.membroRepository = membroRepository;
        this.colunaRepository = colunaRepository;
        this.quadroService = quadroService;
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

    public Tarefa criar(Long projetoId, TarefaRequestDTO dto, String email) {
        Projeto projeto = projetoService.buscarProjetoPorId(projetoId);
        projetoService.conferirLider(projeto, email);
        conferirPrazo(dto, null);
        String coluna = dto.getColuna() == null || dto.getColuna().isBlank() ? "A fazer" : dto.getColuna();
        quadroService.buscarOuCriar(projetoId, coluna);
        int ordem = repository.findByProjetoIdAndColunaOrderByOrdemAscIdAsc(projetoId, coluna).stream()
                .filter(tarefa -> !Boolean.TRUE.equals(tarefa.getExcluida()))
                .map(Tarefa::getOrdem)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(-1) + 1;

        Tarefa tarefa = Tarefa.builder()
                .projeto(projeto)
                .nome(dto.getNome())
                .descricao(dto.getDescricao())
                .responsavel(dto.getResponsavel())
                .coluna(coluna)
                .ordem(ordem)
                .excluida(false)
                .prazo(dto.getPrazo())
                .horaPrazo(dto.getHoraPrazo())
                .progresso(calcularProgresso(dto.getChecklist()))
                .comentario(dto.getComentario())
                .checklist(dto.getChecklist())
                .anexo(dto.getAnexo())
                .status(dto.getStatus() == null ? StatusTarefa.PENDENTE : dto.getStatus())
                .build();

        Tarefa salva = repository.save(tarefa);
        notificarAtribuidos(salva, Set.of());
        return salva;
    }

    public Tarefa editar(Long id, TarefaRequestDTO dto, String email) {
        Tarefa tarefa = buscarPorId(id);
        conferirEdicao(tarefa, dto, email);
        conferirPrazo(dto, tarefa.getPrazo() + " " + tarefa.getHoraPrazo());
        Set<String> responsaveisAnteriores = emails(tarefa.getResponsavel());
        StatusTarefa statusAnterior = tarefa.getStatus();

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

        Tarefa salva = repository.save(tarefa);
        notificarAtribuidos(salva, responsaveisAnteriores);
        if (salva.getStatus() != statusAnterior && salva.getStatus() == StatusTarefa.EM_VALIDACAO) {
            notificacaoService.criarValidacao(salva);
        }
        if (salva.getStatus() != statusAnterior) {
            notificacaoService.criarAtualizacaoTarefa(salva);
        }
        return salva;
    }

    public void excluir(Long id, String email) {
        Tarefa tarefa = buscarPorId(id);
        projetoService.conferirLider(tarefa.getProjeto(), email);
        tarefa.setExcluida(true);
        repository.save(tarefa);
    }

    public Tarefa restaurar(Long id, Long colunaId, String email) {
        Tarefa tarefa = buscarPorId(id);
        projetoService.conferirLider(tarefa.getProjeto(), email);
        var coluna = quadroService.buscar(colunaId);
        if (!coluna.getProjeto().getId().equals(tarefa.getProjeto().getId())
                || Boolean.TRUE.equals(coluna.getExcluida())) {
            throw new RuntimeException("A coluna escolhida é inválida.");
        }
        tarefa.setColuna(coluna.getNome());
        tarefa.setExcluida(false);
        tarefa.setOrdem(repository.findByProjetoIdAndColunaOrderByOrdemAscIdAsc(
                tarefa.getProjeto().getId(), coluna.getNome()).size());
        return repository.save(tarefa);
    }

    public void excluirDefinitivo(Long id, String email) {
        Tarefa tarefa = buscarPorId(id);
        projetoService.conferirLider(tarefa.getProjeto(), email);
        repository.delete(tarefa);
    }

    public TarefaResponseDTO toDto(Tarefa tarefa) {
        return TarefaResponseDTO.builder()
                .id(tarefa.getId())
                .projetoId(tarefa.getProjeto().getId())
                .nome(tarefa.getNome())
                .descricao(tarefa.getDescricao())
                .responsavel(tarefa.getResponsavel())
                .coluna(tarefa.getColuna())
                .colunaId(colunaRepository.findFirstByProjetoIdAndNomeIgnoreCase(
                        tarefa.getProjeto().getId(), tarefa.getColuna()).map(coluna -> coluna.getId()).orElse(null))
                .ordem(tarefa.getOrdem())
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

    private void notificarAtribuidos(Tarefa tarefa, Set<String> anteriores) {
        for (String email : emails(tarefa.getResponsavel())) {
            if (!anteriores.contains(email)) {
                notificacaoService.criarTarefaAtribuida(tarefa, email);
            }
        }
    }

    private Set<String> emails(String responsavel) {
        if (responsavel == null || responsavel.isBlank()) return Set.of();
        return Arrays.stream(responsavel.split(","))
                .map(String::trim)
                .filter(email -> !email.isBlank())
                .collect(java.util.stream.Collectors.toSet());
    }

    private void conferirEdicao(Tarefa tarefa, TarefaRequestDTO dto, String email) {
        boolean lider = tarefa.getProjeto().getLiderEmail().equalsIgnoreCase(email);
        StatusTarefa atual = tarefa.getStatus();
        StatusTarefa novo = dto.getStatus() == null ? atual : dto.getStatus();

        if (atual == StatusTarefa.APROVADA) {
            throw new RuntimeException("Esta tarefa já foi concluída.");
        }

        if (lider) {
            if (atual == StatusTarefa.EM_VALIDACAO && novo != StatusTarefa.APROVADA && novo != StatusTarefa.AJUSTES) {
                throw new RuntimeException("A tarefa aguarda aprovação ou solicitação de ajustes.");
            }
            if (atual == StatusTarefa.AJUSTES) {
                throw new RuntimeException("A tarefa aguarda o início dos ajustes.");
            }
            if (novo == StatusTarefa.EM_VALIDACAO) {
                throw new RuntimeException("Somente membros podem enviar tarefas para validação.");
            }
            if (atual != StatusTarefa.EM_VALIDACAO && (novo == StatusTarefa.APROVADA || novo == StatusTarefa.AJUSTES)) {
                throw new RuntimeException("A tarefa precisa aguardar validação.");
            }
            return;
        }

        if (!membroRepository.existsByProjetoIdAndEmailIgnoreCaseAndStatusAndDataSaidaIsNull(
                tarefa.getProjeto().getId(), email, StatusConvite.ACEITO)) {
            throw new RuntimeException("Você não faz parte deste projeto.");
        }

        if (!mesmosDadosFixos(tarefa, dto) || !mesmosItens(tarefa.getChecklist(), dto.getChecklist())) {
            throw new RuntimeException("Somente o líder pode alterar os dados desta tarefa.");
        }

        if (atual == StatusTarefa.EM_VALIDACAO && novo != StatusTarefa.EM_ANDAMENTO) {
            throw new RuntimeException("Cancele o envio para editar esta tarefa.");
        }
        if (atual == StatusTarefa.AJUSTES && novo != StatusTarefa.EM_ANDAMENTO) {
            throw new RuntimeException("Inicie os ajustes para editar esta tarefa.");
        }
        if (atual != StatusTarefa.EM_VALIDACAO && atual != StatusTarefa.AJUSTES
                && novo != atual && novo != StatusTarefa.EM_VALIDACAO) {
            throw new RuntimeException("Esta alteração de status não é permitida.");
        }
        if (novo == StatusTarefa.EM_VALIDACAO && calcularProgresso(dto.getChecklist()) < 100
                && dto.getChecklist() != null && !dto.getChecklist().isBlank()) {
            throw new RuntimeException("Conclua todo o checklist antes de enviar para validação.");
        }
    }

    private boolean mesmosDadosFixos(Tarefa tarefa, TarefaRequestDTO dto) {
        return Objects.equals(tarefa.getNome(), dto.getNome())
                && Objects.equals(tarefa.getDescricao(), dto.getDescricao())
                && Objects.equals(tarefa.getResponsavel(), dto.getResponsavel())
                && Objects.equals(tarefa.getColuna(), dto.getColuna())
                && Objects.equals(tarefa.getPrazo(), dto.getPrazo())
                && Objects.equals(tarefa.getHoraPrazo(), dto.getHoraPrazo())
                && Objects.equals(tarefa.getAnexo(), dto.getAnexo())
                && Objects.equals(tarefa.getExcluida(), dto.getExcluida());
    }

    private boolean mesmosItens(String atual, String novo) {
        return normalizarChecklist(atual).equals(normalizarChecklist(novo));
    }

    private List<String> normalizarChecklist(String checklist) {
        if (checklist == null || checklist.isBlank()) return List.of();
        return checklist.lines()
                .map(item -> item.replaceFirst("^\\[(x| )\\]\\s*", "").trim())
                .filter(item -> !item.isBlank())
                .toList();
    }

    private void conferirPrazo(TarefaRequestDTO dto, String prazoAtual) {
        if (dto.getPrazo() == null) return;
        String novoPrazo = dto.getPrazo() + " " + dto.getHoraPrazo();
        if (novoPrazo.equals(prazoAtual)) return;
        LocalDate hoje = LocalDate.now();
        if (dto.getPrazo().isBefore(hoje)) {
            throw new RuntimeException("Escolha uma data a partir de agora.");
        }
        if (dto.getPrazo().equals(hoje) && dto.getHoraPrazo() != null && !dto.getHoraPrazo().isBlank()
                && LocalDateTime.of(hoje, LocalTime.parse(dto.getHoraPrazo())).isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Escolha um horário a partir de agora.");
        }
    }
}
