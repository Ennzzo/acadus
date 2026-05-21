package com.tis.acadus.service;

import java.util.List;

import org.springframework.stereotype.Service;

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

        Usuario usuario = Usuario.builder()
                .nome(dto.getNome())
                .sobrenome(dto.getSobrenome())
                .email(dto.getEmail())
                .senha(dto.getSenha())
                .build();

        return repository.save(usuario);
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

    public UsuarioResponseDTO toDto(Usuario usuario) {

        return UsuarioResponseDTO.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .sobrenome(usuario.getSobrenome())
                .email(usuario.getEmail())
                .build();
    }
}
