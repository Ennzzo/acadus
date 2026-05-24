package com.tis.acadus.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tis.acadus.dto.EquipeUsuarioRequestDTO;
import com.tis.acadus.dto.EquipeUsuarioResponseDTO;
import com.tis.acadus.entity.Equipe;
import com.tis.acadus.entity.EquipeUsuario;
import com.tis.acadus.entity.Usuario;
import com.tis.acadus.repository.EquipeRepository;
import com.tis.acadus.repository.EquipeUsuarioRepository;
import com.tis.acadus.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EquipeUsuarioService {
    private final EquipeUsuarioRepository equipeUsuarioRepository;
    private final EquipeRepository equipeRepository;
    private final UsuarioRepository usuarioRepository;

    public List<EquipeUsuarioResponseDTO> listarEquipesUsuarios() {
        return equipeUsuarioRepository.findAll()
                .stream()
                .map(this::converterParaDTO)
                .toList();
    }

    public EquipeUsuarioResponseDTO buscarEquipeUsuarioPorId(Long id) {
        EquipeUsuario equipeUsuario = equipeUsuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Vínculo equipe-usuário não encontrado"));

        return converterParaDTO(equipeUsuario);
    }

    public EquipeUsuarioResponseDTO criarEquipeUsuario(EquipeUsuarioRequestDTO dto) {
        Equipe equipe = equipeRepository.findById(dto.getIdEquipe())
                .orElseThrow(() -> new RuntimeException("Equipe não encontrada"));

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        EquipeUsuario equipeUsuario = EquipeUsuario.builder()
                .equipe(equipe)
                .usuario(usuario)
                .build();

        EquipeUsuario salvo = equipeUsuarioRepository.save(equipeUsuario);

        return converterParaDTO(salvo);
    }

    public void excluirEquipeUsuario(Long id) {
        EquipeUsuario equipeUsuario = equipeUsuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Vínculo equipe-usuário não encontrado"));

        equipeUsuarioRepository.delete(equipeUsuario);
    }

    private EquipeUsuarioResponseDTO converterParaDTO(EquipeUsuario equipeUsuario) {
        return EquipeUsuarioResponseDTO.builder()
                .id(equipeUsuario.getId())
                .idEquipe(equipeUsuario.getEquipe().getId())
                .nomeEquipe(equipeUsuario.getEquipe().getNome())
                .idUsuario(equipeUsuario.getUsuario().getId())
                .nomeUsuario(equipeUsuario.getUsuario().getNome())
                .build();
    }
}
