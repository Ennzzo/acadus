package com.tis.acadus.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tis.acadus.dto.EquipeRequestDTO;
import com.tis.acadus.dto.EquipeResponseDTO;
import com.tis.acadus.dto.BloqueioMembroRequestDTO;
import com.tis.acadus.dto.MembroEquipeRequestDTO;
import com.tis.acadus.dto.MembroEquipeResponseDTO;
import com.tis.acadus.dto.MembroStatusRequestDTO;
import com.tis.acadus.entity.MembroEquipe;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.entity.enums.PapelMembro;
import com.tis.acadus.entity.enums.StatusConvite;
import com.tis.acadus.repository.MembroEquipeRepository;
import com.tis.acadus.repository.ProjetoRepository;

@Service
public class EquipeService {
    private final ProjetoService projetoService;
    private final ProjetoRepository projetoRepository;
    private final MembroEquipeRepository membroRepository;

    public EquipeService(
            ProjetoService projetoService,
            ProjetoRepository projetoRepository,
            MembroEquipeRepository membroRepository) {
        this.projetoService = projetoService;
        this.projetoRepository = projetoRepository;
        this.membroRepository = membroRepository;
    }

    public EquipeResponseDTO buscar(Long projetoId) {
        Projeto projeto = projetoService.buscarProjetoPorId(projetoId);
        return toDto(projeto);
    }

    public EquipeResponseDTO salvarNome(Long projetoId, EquipeRequestDTO dto) {
        Projeto projeto = projetoService.buscarProjetoPorId(projetoId);
        projeto.setNomeEquipe(dto.getNomeEquipe());
        projetoRepository.save(projeto);
        return toDto(projeto);
    }

    public MembroEquipeResponseDTO convidar(Long projetoId, MembroEquipeRequestDTO dto) {
        Projeto projeto = projetoService.buscarProjetoPorId(projetoId);

        MembroEquipe membro = MembroEquipe.builder()
                .projeto(projeto)
                .email(dto.getEmail())
                .papel(dto.getPapel() == PapelMembro.LIDER ? PapelMembro.MEMBRO : dto.getPapel())
                .mensagem(dto.getMensagem())
                .status(StatusConvite.PENDENTE)
                .transferenciaPendente(false)
                .bloqueado(false)
                .dataConvite(LocalDate.now())
                .build();

        return toDto(membroRepository.save(membro));
    }

    public MembroEquipeResponseDTO alterarStatus(Long membroId, MembroStatusRequestDTO dto) {
        MembroEquipe membro = buscarMembro(membroId);
        membro.setStatus(dto.getStatus());
        return toDto(membroRepository.save(membro));
    }

    public MembroEquipeResponseDTO pedirLideranca(Long membroId) {
        MembroEquipe membro = buscarMembro(membroId);
        if (membro.getStatus() != StatusConvite.ACEITO) {
            throw new RuntimeException("O membro precisa aceitar o convite antes da transferência.");
        }
        membro.setTransferenciaPendente(true);
        return toDto(membroRepository.save(membro));
    }

    @Transactional
    public MembroEquipeResponseDTO aceitarLideranca(Long membroId) {
        MembroEquipe novoLider = buscarMembro(membroId);
        Projeto projeto = novoLider.getProjeto();

        membroRepository.findFirstByProjetoIdAndPapelAndStatus(
                projeto.getId(), PapelMembro.LIDER, StatusConvite.ACEITO)
                .ifPresent(liderAtual -> {
                    liderAtual.setPapel(PapelMembro.MEMBRO);
                    membroRepository.save(liderAtual);
                });

        novoLider.setPapel(PapelMembro.LIDER);
        novoLider.setTransferenciaPendente(false);
        projeto.setLiderEmail(novoLider.getEmail());
        projetoRepository.save(projeto);

        return toDto(membroRepository.save(novoLider));
    }

    public MembroEquipeResponseDTO recusarLideranca(Long membroId) {
        MembroEquipe membro = buscarMembro(membroId);
        membro.setTransferenciaPendente(false);
        return toDto(membroRepository.save(membro));
    }

    public MembroEquipeResponseDTO bloquear(Long membroId, BloqueioMembroRequestDTO dto) {
        MembroEquipe membro = buscarMembro(membroId);
        membro.setBloqueado(Boolean.TRUE.equals(dto.getBloqueado()));
        membro.setMotivoBloqueio(Boolean.TRUE.equals(dto.getBloqueado()) ? dto.getMotivo() : null);
        return toDto(membroRepository.save(membro));
    }

    public void removerMembro(Long membroId) {
        membroRepository.delete(buscarMembro(membroId));
    }

    @Transactional
    public void excluirEquipe(Long projetoId) {
        Projeto projeto = projetoService.buscarProjetoPorId(projetoId);
        membroRepository.deleteByProjetoId(projetoId);
        projeto.setNomeEquipe(null);
        projetoRepository.save(projeto);
    }

    private MembroEquipe buscarMembro(Long membroId) {
        return membroRepository.findById(membroId)
                .orElseThrow(() -> new RuntimeException("Membro não encontrado."));
    }

    private EquipeResponseDTO toDto(Projeto projeto) {
        return EquipeResponseDTO.builder()
                .projetoId(projeto.getId())
                .nomeProjeto(projeto.getNomeProjeto())
                .nomeEquipe(projeto.getNomeEquipe())
                .liderEmail(projeto.getLiderEmail())
                .membros(membroRepository.findByProjetoIdOrderByIdAsc(projeto.getId()).stream()
                        .map(this::toDto)
                        .toList())
                .build();
    }

    private MembroEquipeResponseDTO toDto(MembroEquipe membro) {
        return MembroEquipeResponseDTO.builder()
                .id(membro.getId())
                .projetoId(membro.getProjeto().getId())
                .email(membro.getEmail())
                .papel(membro.getPapel())
                .mensagem(membro.getMensagem())
                .transferenciaPendente(Boolean.TRUE.equals(membro.getTransferenciaPendente()))
                .bloqueado(Boolean.TRUE.equals(membro.getBloqueado()))
                .motivoBloqueio(membro.getMotivoBloqueio())
                .status(membro.getStatus())
                .dataConvite(membro.getDataConvite())
                .build();
    }
}
