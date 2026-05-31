"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, updateCurrentUser } from "@/lib/auth";
import { toast } from "@/lib/toast";
import { Usuario } from "@/types/usuario";
import styles from "./styles.module.css";

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(() => getCurrentUser());
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [sobrenome, setSobrenome] = useState(usuario?.sobrenome ?? "");
  const [fotoUrl, setFotoUrl] = useState<string | null>(usuario?.fotoUrl ?? null);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 1 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setFotoUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!usuario) {
      toast.error("Faça login novamente para editar seu perfil.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas precisam ser iguais.");
      return;
    }

    try {
      setLoading(true);
      const updated = await apiFetch<Usuario>(`/usuarios/${usuario.id}/perfil`, {
        method: "PUT",
        body: JSON.stringify({
          nome,
          sobrenome,
          fotoUrl,
          novaSenha: novaSenha || null,
        }),
      });
      updateCurrentUser(updated);
      setUsuario(updated);
      setNovaSenha("");
      setConfirmarSenha("");
      toast.success("Perfil atualizado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível atualizar o perfil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <h1>Perfil</h1>
      </header>
      <section className={styles.page}>
        <form className={styles.card} onSubmit={save}>
          <div>
            <h2>Meu perfil</h2>
            <p>Atualize seus dados pessoais e sua senha.</p>
          </div>

          <div className={styles.photoRow}>
            <span className={styles.photo}>
              {fotoUrl
                ? <Image src={fotoUrl} alt="" width={80} height={80} unoptimized />
                : <span>{nome.charAt(0).toUpperCase() || "U"}</span>}
            </span>
            <div className={styles.photoActions}>
              <label className={styles.photoButton}>
                <input type="file" accept="image/*" onChange={selectPhoto} />
                Escolher foto
              </label>
              {fotoUrl && <button type="button" onClick={() => setFotoUrl(null)}>Remover foto</button>}
              <small>Imagem de até 1 MB.</small>
            </div>
          </div>

          <div className={styles.grid}>
            <label>
              <span>Nome</span>
              <input value={nome} onChange={(event) => setNome(event.target.value)} maxLength={100} required />
            </label>
            <label>
              <span>Sobrenome</span>
              <input value={sobrenome} onChange={(event) => setSobrenome(event.target.value)} maxLength={100} required />
            </label>
          </div>

          <label>
            <span>E-mail</span>
            <input value={usuario?.email ?? ""} disabled />
          </label>

          <div className={styles.section}>
            <div>
              <h3>Alterar senha</h3>
              <p>Deixe os campos vazios para manter sua senha atual.</p>
            </div>
            <div className={styles.grid}>
              <label>
                <span>Nova senha</span>
                <input type="password" value={novaSenha} onChange={(event) => setNovaSenha(event.target.value)} minLength={6} autoComplete="new-password" />
              </label>
              <label>
                <span>Confirmar nova senha</span>
                <input type="password" value={confirmarSenha} onChange={(event) => setConfirmarSenha(event.target.value)} minLength={6} autoComplete="new-password" />
              </label>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar alterações"}</button>
          </div>
        </form>
      </section>
    </section>
  );
}
