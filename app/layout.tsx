'use client';

import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/context/ThemeContext'
import { SidebarProvider } from '@/lib/context/SidebarContext'
import { WalletProvider } from '@/lib/context/WalletContext'
import { SocketProvider } from '@/lib/context/SocketContext'
import { useEffect, useState } from 'react'

// Note: metadata export removed due to 'use client' directive
// Move metadata to a server component wrapper if needed

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show loading animation for 2 seconds (like Facebook)
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => {
      clearTimeout(splashTimer);
    };
  }, []);

  return (
    <html lang="en" className="light">
      <head>
        <title>Tokfri - Own Your Voice, Earn Your Influence</title>
        <meta name="description" content="Decentralized social network built on Sui blockchain" />
      </head>
      <body className="bg-white">
        {/* Splash Screen - Always shows on app load */}
        {showSplash && (
          <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
            <div className="flex gap-3">
              {/* Blue dot */}
              <div className="w-4 h-4 bg-pink-600 rounded-full animate-dot-pulse"></div>
              {/* Pink dot - with delay */}
              <div className="w-4 h-4 bg-pink-600 rounded-full animate-dot-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        )}

        {/* Main App Content */}
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
