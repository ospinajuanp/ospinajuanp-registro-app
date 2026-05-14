import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "optional",
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Registro de Niños",
  description: "Aplicación de búsqueda de información de entrega de paquetes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={nunito.className}>
        <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
        {children}
      </body>
    </html>
  );
}
