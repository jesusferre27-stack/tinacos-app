import "./globals.css";

export const metadata = {
  title: "Tinacos App",
  description: "Plataforma automatizada para venta de tinacos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
