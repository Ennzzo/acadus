import Image from "next/image";

interface UserAvatarProps {
  fotoUrl?: string | null;
  nome?: string | null;
  email?: string | null;
}

export default function UserAvatar({ fotoUrl, nome, email }: UserAvatarProps) {
  if (fotoUrl) {
    return <Image src={fotoUrl} alt="" width={32} height={32} unoptimized />;
  }

  return <>{(nome || email || "U").slice(0, 1).toUpperCase()}</>;
}
