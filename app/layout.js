import "./globals.css";
import ClientLayoutWrapper from "../components/ClientLayoutWrapper";

export const metadata = {
  title: "TINACOS LOGISTICS - AI Orchestration",
  description: "Plataforma automatizada para venta de tinacos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-['Inter'] bg-[#060e20]" suppressHydrationWarning>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
