package com.tis.acadus.service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.tis.acadus.dto.ChatContatoResponseDTO;
import com.tis.acadus.dto.ChatMensagemRequestDTO;
import com.tis.acadus.dto.ChatMensagemResponseDTO;
import com.tis.acadus.dto.ChatProjetoResponseDTO;
import com.tis.acadus.entity.ChatLeitura;
import com.tis.acadus.entity.ChatMensagem;
import com.tis.acadus.entity.ChatOculto;
import com.tis.acadus.entity.MembroEquipe;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.entity.Usuario;
import com.tis.acadus.entity.enums.StatusConvite;
import com.tis.acadus.repository.ChatMensagemRepository;
import com.tis.acadus.repository.ChatLeituraRepository;
import com.tis.acadus.repository.ChatOcultoRepository;
import com.tis.acadus.repository.MembroEquipeRepository;
import com.tis.acadus.repository.UsuarioRepository;

@Service
public class ChatService {
    private final ChatMensagemRepository repository;
    private final ChatLeituraRepository leituraRepository;
    private final ChatOcultoRepository ocultoRepository;
    private final ProjetoService projetoService;
    private final MembroEquipeRepository membroRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacaoService notificacaoService;

    public ChatService(
            ChatMensagemRepository repository,
            ChatLeituraRepository leituraRepository,
            ChatOcultoRepository ocultoRepository,
            ProjetoService projetoService,
            MembroEquipeRepository membroRepository,
            UsuarioRepository usuarioRepository,
            NotificacaoService notificacaoService) {
        this.repository = repository;
        this.leituraRepository = leituraRepository;
        this.ocultoRepository = ocultoRepository;
        this.projetoService = projetoService;
        this.membroRepository = membroRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificacaoService = notificacaoService;
    }

    public List<ChatProjetoResponseDTO> listarProjetos(String email) {
        Map<Long, ChatProjetoResponseDTO> projetos = new LinkedHashMap<>();
        Set<Long> encontrados = new HashSet<>();

        for (MembroEquipe membro : membroRepository.findByEmailOrderByIdDesc(email)) {
            if (membro.getStatus() != StatusConvite.ACEITO) {
                continue;
            }

            Projeto projeto = membro.getProjeto();
            if (!encontrados.add(projeto.getId())) {
                continue;
            }

            LocalDateTime ocultoAte = buscarOcultoAte(email, tipoEquipe(projeto.getId()));
            if (membro.getDataSaida() != null
                    && ocultoAte != null
                    && (membro.getDataEntrada() == null || !ocultoAte.isBefore(membro.getDataEntrada()))) {
                continue;
            }

            List<ChatMensagem> mensagens = mensagensEquipe(projeto.getId(), email);
            ChatMensagem ultima = ultimaMensagem(mensagens);
            projetos.put(projeto.getId(), ChatProjetoResponseDTO.builder()
                    .id(projeto.getId())
                    .nomeProjeto(projeto.getNomeProjeto())
                    .liderEmail(projeto.getLiderEmail())
                    .statusMembro(membro.getDataSaida() == null ? "ACEITO" : "SAIU")
                    .dataSaida(membro.getDataSaida())
                    .ultimaMensagem(ultima != null ? ultima.getDataHora() : null)
                    .resumo(resumo(ultima))
                    .naoVisualizada(naoVisualizada(email, tipoEquipe(projeto.getId()), mensagens))
                    .visivelDesde(ocultoAte)
                    .build());
        }

        return projetos.values().stream().toList();
    }

    public List<ChatMensagem> listar(Long projetoId, String tipoChat, String email) {
        buscarVinculo(projetoId, email);
        return mensagensEquipe(projetoId, email);
    }

    public ChatMensagem enviar(Long projetoId, ChatMensagemRequestDTO dto, String email) {
        conferirAtivo(projetoId, email);
        if (!dto.getAutorEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Não foi possível enviar a mensagem.");
        }

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

    public List<ChatContatoResponseDTO> listarContatos(String email) {
        Map<String, ChatContatoResponseDTO> contatos = new LinkedHashMap<>();

        for (ChatMensagem mensagem : repository.findByTipoChatStartingWithOrderByDataHoraDescIdDesc("PRIVADO:")) {
            String contatoEmail = buscarContato(mensagem.getTipoChat(), email);
            LocalDateTime ocultoAte = buscarOcultoAte(email, mensagem.getTipoChat());
            if (contatoEmail == null
                    || contatos.containsKey(contatoEmail)
                    || (ocultoAte != null && !mensagem.getDataHora().isAfter(ocultoAte))) {
                continue;
            }

            Usuario usuario = buscarUsuario(contatoEmail);
            contatos.put(contatoEmail, toContato(usuario, mensagem, email));
        }

        return contatos.values().stream().toList();
    }

    public ChatContatoResponseDTO buscarContato(String email) {
        return toContato(buscarUsuario(email), null, null);
    }

    public List<ChatMensagem> listarPrivado(String email, String destinatario) {
        buscarUsuario(email);
        buscarUsuario(destinatario);
        String tipoChat = tipoPrivado(email, destinatario);
        LocalDateTime ocultoAte = buscarOcultoAte(email, tipoChat);
        return repository.findByTipoChatOrderByDataHoraAscIdAsc(tipoChat).stream()
                .filter(mensagem -> ocultoAte == null || mensagem.getDataHora().isAfter(ocultoAte))
                .toList();
    }

    public ChatMensagem enviarPrivado(String email, String destinatario, ChatMensagemRequestDTO dto) {
        Usuario autor = buscarUsuario(email);
        buscarUsuario(destinatario);

        if (!dto.getAutorEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Não foi possível enviar a mensagem.");
        }

        ChatMensagem mensagem = ChatMensagem.builder()
                .autorEmail(autor.getEmail())
                .autorNome(dto.getAutorNome())
                .tipoChat(tipoPrivado(email, destinatario))
                .conteudo(dto.getConteudo())
                .anexo(dto.getAnexo())
                .editada(false)
                .excluida(false)
                .dataHora(LocalDateTime.now())
                .build();

        ChatMensagem salva = repository.save(mensagem);
        notificacaoService.criarMensagemPrivada(autor, destinatario);
        return salva;
    }

    public ChatMensagem editar(Long id, ChatMensagemRequestDTO dto, String email) {
        ChatMensagem mensagem = buscar(id);
        conferirAutorAtivo(mensagem, email);
        mensagem.setConteudoAnterior(mensagem.getConteudo());
        mensagem.setConteudo(dto.getConteudo());
        mensagem.setAnexo(dto.getAnexo());
        mensagem.setEditada(true);
        return repository.save(mensagem);
    }

    public ChatMensagem excluir(Long id, String email) {
        ChatMensagem mensagem = buscar(id);
        conferirAutorAtivo(mensagem, email);
        mensagem.setConteudoAnterior(mensagem.getConteudo());
        mensagem.setConteudo("Mensagem excluída.");
        mensagem.setAnexo(null);
        mensagem.setExcluida(true);
        return repository.save(mensagem);
    }

    public void ocultarPrivado(String email, String destinatario) {
        buscarUsuario(email);
        buscarUsuario(destinatario);
        ocultar(email, tipoPrivado(email, destinatario));
    }

    public void ocultarEquipe(Long projetoId, String email) {
        MembroEquipe membro = buscarVinculo(projetoId, email);
        if (membro.getDataSaida() == null) {
            throw new RuntimeException("Saia do projeto antes de excluir este chat.");
        }
        ocultar(email, tipoEquipe(projetoId));
    }

    public void marcarEquipeComoVisualizada(Long projetoId, String email) {
        buscarVinculo(projetoId, email);
        marcarComoVisualizada(email, tipoEquipe(projetoId));
    }

    public void marcarPrivadoComoVisualizado(String email, String destinatario) {
        buscarUsuario(email);
        buscarUsuario(destinatario);
        marcarComoVisualizada(email, tipoPrivado(email, destinatario));
    }

    public boolean temNaoVisualizadas(String email) {
        return listarProjetos(email).stream().anyMatch(chat -> Boolean.TRUE.equals(chat.getNaoVisualizada()))
                || listarContatos(email).stream().anyMatch(chat -> Boolean.TRUE.equals(chat.getNaoVisualizada()));
    }

    public ChatMensagemResponseDTO toDto(ChatMensagem mensagem) {
        return ChatMensagemResponseDTO.builder()
                .id(mensagem.getId())
                .projetoId(mensagem.getProjeto() != null ? mensagem.getProjeto().getId() : null)
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

    private MembroEquipe buscarVinculo(Long projetoId, String email) {
        return membroRepository.findFirstByProjetoIdAndEmailIgnoreCaseAndStatusOrderByIdDesc(
                projetoId, email, StatusConvite.ACEITO)
                .orElseThrow(() -> new RuntimeException("Você não tem acesso a este chat."));
    }

    private void conferirAtivo(Long projetoId, String email) {
        if (buscarVinculo(projetoId, email).getDataSaida() != null) {
            throw new RuntimeException("Este chat está congelado porque você saiu do projeto.");
        }
    }

    private void conferirAutorAtivo(ChatMensagem mensagem, String email) {
        if (!mensagem.getAutorEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Você só pode alterar suas próprias mensagens.");
        }

        if (mensagem.getProjeto() != null) {
            conferirAtivo(mensagem.getProjeto().getId(), email);
        }
    }

    private String buscarContato(String tipoChat, String email) {
        String[] partes = tipoChat.split(":", 3);
        if (partes.length != 3) {
            return null;
        }

        if (partes[1].equalsIgnoreCase(email)) return partes[2];
        if (partes[2].equalsIgnoreCase(email)) return partes[1];
        return null;
    }

    private String normalizarTipo(String tipoChat) {
        return "PROFESSOR".equalsIgnoreCase(tipoChat) ? "PROFESSOR" : "EQUIPE";
    }

    private String tipoPrivado(String email, String destinatario) {
        if (email.equalsIgnoreCase(destinatario)) {
            throw new RuntimeException("Escolha outro usuário para iniciar a conversa.");
        }

        boolean emailPrimeiro = email.compareToIgnoreCase(destinatario) <= 0;
        String primeiro = emailPrimeiro ? email : destinatario;
        String segundo = emailPrimeiro ? destinatario : email;
        return "PRIVADO:" + primeiro.toLowerCase() + ":" + segundo.toLowerCase();
    }

    private Usuario buscarUsuario(String email) {
        return usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
    }

    private LocalDateTime buscarOcultoAte(String email, String tipoChat) {
        return ocultoRepository.findByUsuarioEmailIgnoreCaseAndTipoChat(email, tipoChat)
                .map(ChatOculto::getOcultoAte)
                .orElse(null);
    }

    private void ocultar(String email, String tipoChat) {
        ChatOculto oculto = ocultoRepository.findByUsuarioEmailIgnoreCaseAndTipoChat(email, tipoChat)
                .orElseGet(() -> ChatOculto.builder()
                        .usuarioEmail(email)
                        .tipoChat(tipoChat)
                        .build());
        oculto.setOcultoAte(LocalDateTime.now());
        ocultoRepository.save(oculto);
    }

    private List<ChatMensagem> mensagensEquipe(Long projetoId, String email) {
        LocalDateTime ocultoAte = buscarOcultoAte(email, tipoEquipe(projetoId));
        List<MembroEquipe> vinculos = membroRepository.findByProjetoIdOrderByIdAsc(projetoId).stream()
                .filter(membro -> membro.getStatus() == StatusConvite.ACEITO)
                .filter(membro -> membro.getEmail().equalsIgnoreCase(email))
                .toList();

        return repository.findByProjetoIdAndTipoChatOrderByDataHoraAscIdAsc(projetoId, "EQUIPE").stream()
                .filter(mensagem -> ocultoAte == null || mensagem.getDataHora().isAfter(ocultoAte))
                .filter(mensagem -> vinculos.stream().anyMatch(vinculo -> mensagemDuranteVinculo(mensagem, vinculo, vinculos)))
                .toList();
    }

    private boolean mensagemDuranteVinculo(ChatMensagem mensagem, MembroEquipe vinculo, List<MembroEquipe> vinculos) {
        LocalDateTime entrada = vinculo.getDataEntrada() != null
                ? vinculo.getDataEntrada()
                : vinculo.getDataConvite().atStartOfDay();
        if (entrada.toLocalTime().equals(LocalTime.MIDNIGHT)) {
            entrada = vinculos.stream()
                    .filter(item -> item.getId() < vinculo.getId() && item.getDataSaida() != null)
                    .map(MembroEquipe::getDataSaida)
                    .max(LocalDateTime::compareTo)
                    .map(data -> data.plusNanos(1_000_000))
                    .orElse(entrada);
        }
        return !mensagem.getDataHora().isBefore(entrada)
                && (vinculo.getDataSaida() == null || !mensagem.getDataHora().isAfter(vinculo.getDataSaida()));
    }

    private ChatMensagem ultimaMensagem(List<ChatMensagem> mensagens) {
        return mensagens.isEmpty() ? null : mensagens.get(mensagens.size() - 1);
    }

    private boolean naoVisualizada(String email, String tipoChat, List<ChatMensagem> mensagens) {
        LocalDateTime visualizadoAte = leituraRepository.findByUsuarioEmailIgnoreCaseAndTipoChat(email, tipoChat)
                .map(ChatLeitura::getVisualizadoAte)
                .orElse(null);

        return mensagens.stream().anyMatch(mensagem ->
                !mensagem.getAutorEmail().equalsIgnoreCase(email)
                        && (visualizadoAte == null || mensagem.getDataHora().isAfter(visualizadoAte)));
    }

    private void marcarComoVisualizada(String email, String tipoChat) {
        ChatLeitura leitura = leituraRepository.findByUsuarioEmailIgnoreCaseAndTipoChat(email, tipoChat)
                .orElseGet(() -> ChatLeitura.builder()
                        .usuarioEmail(email)
                        .tipoChat(tipoChat)
                        .build());
        leitura.setVisualizadoAte(LocalDateTime.now());
        leituraRepository.save(leitura);
    }

    private String tipoEquipe(Long projetoId) {
        return "EQUIPE:" + projetoId;
    }

    private String resumo(ChatMensagem mensagem) {
        if (mensagem == null) return null;
        String texto = mensagem.getConteudo().replaceAll("\\s+", " ").trim();
        return texto.length() > 58 ? texto.substring(0, 58) + "..." : texto;
    }

    private ChatContatoResponseDTO toContato(Usuario usuario, ChatMensagem ultima, String emailAtual) {
        String tipoChat = ultima != null ? ultima.getTipoChat() : null;
        LocalDateTime ocultoAte = tipoChat != null && emailAtual != null
                ? buscarOcultoAte(emailAtual, tipoChat)
                : null;
        List<ChatMensagem> mensagens = tipoChat != null
                ? repository.findByTipoChatOrderByDataHoraAscIdAsc(tipoChat).stream()
                        .filter(mensagem -> ocultoAte == null || mensagem.getDataHora().isAfter(ocultoAte))
                        .toList()
                : List.of();
        return ChatContatoResponseDTO.builder()
                .email(usuario.getEmail())
                .nome(usuario.getNome())
                .sobrenome(usuario.getSobrenome())
                .fotoUrl(usuario.getFotoUrl())
                .ultimaMensagem(ultima != null ? ultima.getDataHora() : null)
                .resumo(resumo(ultima))
                .naoVisualizada(tipoChat != null && emailAtual != null && naoVisualizada(emailAtual, tipoChat, mensagens))
                .build();
    }
}
