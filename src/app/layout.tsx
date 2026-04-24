import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Workshop de IA - Votação',
  description: 'Vote no melhor projeto de IA para Negócios',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
