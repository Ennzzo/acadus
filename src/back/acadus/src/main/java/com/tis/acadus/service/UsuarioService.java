package com.tis.acadus.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tis.acadus.dto.LoginRequestDTO;
import com.tis.acadus.dto.PerfilRequestDTO;
import com.tis.acadus.dto.UsuarioRequestDTO;
import com.tis.acadus.dto.UsuarioResponseDTO;
import com.tis.acadus.entity.Usuario;
import com.tis.acadus.repository.UsuarioRepository;

@Service
public class UsuarioService {
    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public List<Usuario> listarUsuarios() {
        return repository.findAll();
    }

    public Usuario buscarUsuarioPorId(Long id) {

        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
    }

    public Usuario criarUsuario(UsuarioRequestDTO dto) {
        repository.findByEmail(dto.getEmail())
                .ifPresent(usuario -> {
                    throw new RuntimeException("E-mail já cadastrado.");
                });

        Usuario usuario = Usuario.builder()
                .nome(dto.getNome())
                .sobrenome(dto.getSobrenome())
                .email(dto.getEmail())
                .senha(dto.getSenha())
                .build();

        return repository.save(usuario);
    }

    public Usuario login(LoginRequestDTO dto) {
        Usuario usuario = repository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("E-mail ou senha inválidos."));

        if (!usuario.getSenha().equals(dto.getSenha())) {
            throw new RuntimeException("E-mail ou senha inválidos.");
        }

        return usuario;
    }

    public Usuario editarUsuario(Long id, UsuarioRequestDTO dto) {

        Usuario usuario = buscarUsuarioPorId(id);

        usuario.setNome(dto.getNome());
        usuario.setSobrenome(dto.getSobrenome());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(dto.getSenha());

        return repository.save(usuario);
    }

    public void excluirUsuario(Long id) {

        Usuario usuario = buscarUsuarioPorId(id);

        repository.delete(usuario);
    }

    public Usuario editarPerfil(Long id, PerfilRequestDTO dto) {
        Usuario usuario = buscarUsuarioPorId(id);

        usuario.setNome(dto.getNome());
        usuario.setSobrenome(dto.getSobrenome());
        usuario.setFotoUrl(dto.getFotoUrl());

        if (dto.getNovaSenha() != null && !dto.getNovaSenha().isBlank()) {
            usuario.setSenha(dto.getNovaSenha());
        }

        return repository.save(usuario);
    }

    public UsuarioResponseDTO toDto(Usuario usuario) {

        return UsuarioResponseDTO.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .sobrenome(usuario.getSobrenome())
                .email(usuario.getEmail())
                .fotoUrl(usuario.getFotoUrl())
                .build();
    }
}
