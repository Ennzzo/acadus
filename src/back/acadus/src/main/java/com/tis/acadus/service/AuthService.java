package com.tis.acadus.service;

import org.springframework.stereotype.Service;

import com.tis.acadus.dto.AuthResponseDTO;
import com.tis.acadus.dto.LoginRequestDTO;
import com.tis.acadus.dto.RegisterRequestDTO;
import com.tis.acadus.entity.Usuario;
import com.tis.acadus.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UsuarioRepository usuarioRepository;

    // 🔐 LOGIN
    public AuthResponseDTO login(LoginRequestDTO dto) {

        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!usuario.getSenha().equals(dto.getSenha())) {
            throw new RuntimeException("Senha inválida");
        }

        return toResponse(usuario);
    }

    // 🆕 REGISTRO
    public AuthResponseDTO register(RegisterRequestDTO dto) {

        if (usuarioRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        Usuario usuario = Usuario.builder()
                .nome(dto.getNome())
                .sobrenome(dto.getSobrenome())
                .email(dto.getEmail())
                .senha(dto.getSenha())
                .build();

        Usuario salvo = usuarioRepository.save(usuario);

        return toResponse(salvo);
    }

    private AuthResponseDTO toResponse(Usuario usuario) {
        return AuthResponseDTO.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .sobrenome(usuario.getSobrenome())
                .email(usuario.getEmail())
                .build();
    }
}
