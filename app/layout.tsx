import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/context/ThemeContext'
import { SidebarProvider } from '@/lib/context/SidebarContext'
import { WalletProvider } from '@/lib/context/WalletContext'
import { SocketProvider } from '@/lib/context/SocketContext'

export const metadata: Metadata = {
  title: 'Tokfri - Own Your Voice, Earn Your Influence',
  description: 'Decentralized social network built on Sui blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <ThemeProvider>
          <WalletProvider>
            <SocketProvider>
              <SidebarProvider>
                {children}
              </SidebarProvider>
            </SocketProvider>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
