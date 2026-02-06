import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MCPForge - Custom MCP Servers for AI',
  description:
    'MCPForge gives AI models new capabilities through custom Model Context Protocol servers for resume parsing, portfolio analysis, and GitHub insights.',
  keywords: ['MCP', 'Model Context Protocol', 'AI', 'Claude', 'resume', 'portfolio', 'GitHub'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-primary text-text antialiased">
        {children}
      </body>
    </html>
  );
}
