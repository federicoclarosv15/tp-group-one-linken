import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/layout/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Linken — Tokenización de Energía Renovable",
  description: "Invertí en proyectos de energía renovable mediante tokens ERC-20",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <Nav />
          <main className="main-content">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
