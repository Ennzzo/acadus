import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acadus",
  description: "Sistema de Gerenciamento de Trabalhos Acadêmicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
