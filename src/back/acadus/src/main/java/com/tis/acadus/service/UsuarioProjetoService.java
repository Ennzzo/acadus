package com.tis.acadus.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tis.acadus.dto.UsuarioProjetoRequestDTO;
import com.tis.acadus.dto.UsuarioProjetoResponseDTO;
import com.tis.acadus.entity.Projeto;
import com.tis.acadus.entity.Usuario;
import com.tis.acadus.entity.UsuarioProjeto;
import com.tis.acadus.repository.ProjetoRepository;
import com.tis.acadus.repository.UsuarioProjetoRepository;
import com.tis.acadus.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioProjetoService {

        private final UsuarioProjetoRepository repository;
        private final UsuarioRepository usuarioRepository;
        private final ProjetoRepository projetoRepository;

        public List<UsuarioProjetoResponseDTO> listar() {
                return repository.findAll()
                                .stream()
                                .map(this::converterParaDTO)
                                .toList();
        }

        public UsuarioProjetoResponseDTO criar(UsuarioProjetoRequestDTO dto) {

                Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

                Projeto projeto = projetoRepository.findById(dto.getIdProjeto())
                                .orElseThrow(() -> new RuntimeException("Projeto não encontrado"));

                UsuarioProjeto usuarioProjeto = UsuarioProjeto.builder()
                                .usuario(usuario)
                                .projeto(projeto)
                                .papel(dto.getPapel())
                                .build();

                UsuarioProjeto salvo = repository.save(usuarioProjeto);

                return converterParaDTO(salvo);
        }

        public void remover(Long id) {
                repository.deleteById(id);
        }

        public UsuarioProjetoResponseDTO converterParaDTO(
                        UsuarioProjeto usuarioProjeto) {

                return UsuarioProjetoResponseDTO.builder()
                                .id(usuarioProjeto.getId())
                                .idUsuario(usuarioProjeto.getUsuario().getId())
                                .nomeUsuario(usuarioProjeto.getUsuario().getNome())
                                .idProjeto(usuarioProjeto.getProjeto().getId())
                                .nomeProjeto(usuarioProjeto.getProjeto().getNome())
                                .papel(usuarioProjeto.getPapel())
                                .build();
        }
}