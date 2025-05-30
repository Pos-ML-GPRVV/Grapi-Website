import { Inter } from 'next/font/google';
import './styles/globals.css'; // Importa os estilos globais com Tailwind

const inter = Inter({ subsets: ['latin'] });

// Metadata pode ser exportada diretamente em Server Components
// export const metadata = {
//   title: 'GrapeIQ Frontend - Tailwind',
//   description: 'Visualização de dados vitivinícolas com Tailwind CSS',
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      {/* Removido espaço extra antes e dentro do head */}
      <head>
        <title>GrapeIQ Frontend - Tailwind</title>
        <meta name="description" content="Visualização de dados vitivinícolas com Tailwind CSS" />
        {/* Adicione outras meta tags ou links aqui, sem espaços extras */}
      </head>
      {/* Aplicamos a classe da fonte e classes Tailwind básicas */}
      <body className={`${inter.className} bg-gray-100`}>
        {children} {/* Renderiza o conteúdo da página */}
      </body>
    </html>
  );
}