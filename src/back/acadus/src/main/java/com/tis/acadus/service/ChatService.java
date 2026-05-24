package com.tis.acadus.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.tis.acadus.dto.ChatMensagemRequestDTO;
import com.tis.acadus.dto.ChatMensagemResponseDTO;
import com.tis.acadus.entity.ChatMensagem;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.repository.ChatMensagemRepository;

@Service
public class ChatService {
    private final ChatMensagemRepository repository;
    private final ProjetoService projetoService;

    public ChatService(ChatMensagemRepository repository, ProjetoService projetoService) {
        this.repository = repository;
        this.projetoService = projetoService;
    }

    public List<ChatMensagem> listar(Long projetoId, String tipoChat) {
        return repository.findByProjetoIdAndTipoChatOrderByDataHoraAscIdAsc(projetoId, normalizarTipo(tipoChat));
    }

    public ChatMensagem enviar(Long projetoId, ChatMensagemRequestDTO dto) {
        Projeto projeto = projetoService.buscarProjetoPorId(projetoId);
        ChatMensagem mensagem = ChatMensagem.builder()
                .projeto(projeto)
                .autorEmail(dto.getAutorEmail())
                .autorNome(dto.getAutorNome())
                .tipoChat(normalizarTipo(dto.getTipoChat()))
                .conteudo(dto.getConteudo())
                .anexo(dto.getAnexo())
                .editada(false)
                .excluida(false)
                .dataHora(LocalDateTime.now())
                .build();

        return repository.save(mensagem);
    }

    public ChatMensagem editar(Long id, ChatMensagemRequestDTO dto) {
        ChatMensagem mensagem = buscar(id);
        mensagem.setConteudoAnterior(mensagem.getConteudo());
        mensagem.setConteudo(dto.getConteudo());
        mensagem.setAnexo(dto.getAnexo());
        mensagem.setEditada(true);
        return repository.save(mensagem);
    }

    public ChatMensagem excluir(Long id) {
        ChatMensagem mensagem = buscar(id);
        mensagem.setConteudoAnterior(mensagem.getConteudo());
        mensagem.setConteudo("Mensagem excluída.");
        mensagem.setAnexo(null);
        mensagem.setExcluida(true);
        return repository.save(mensagem);
    }

    public ChatMensagemResponseDTO toDto(ChatMensagem mensagem) {
        return ChatMensagemResponseDTO.builder()
                .id(mensagem.getId())
                .projetoId(mensagem.getProjeto().getId())
                .autorEmail(mensagem.getAutorEmail())
                .autorNome(mensagem.getAutorNome())
                .tipoChat(mensagem.getTipoChat())
                .conteudo(mensagem.getConteudo())
                .anexo(mensagem.getAnexo())
                .editada(Boolean.TRUE.equals(mensagem.getEditada()))
                .conteudoAnterior(mensagem.getConteudoAnterior())
                .excluida(Boolean.TRUE.equals(mensagem.getExcluida()))
                .dataHora(mensagem.getDataHora())
                .build();
    }

    private ChatMensagem buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mensagem não encontrada."));
    }

    private String normalizarTipo(String tipoChat) {
        return "PROFESSOR".equalsIgnoreCase(tipoChat) ? "PROFESSOR" : "EQUIPE";
    }
}
