import type { Metadata, Viewport } from 'next'
import { DM_Sans } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: 'AgroDesk - Sistema de Inventario y Ventas',
  description: 'Sistema integral de ventas e inventario agricola',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  }
}

export const viewport: Viewport = {
  themeColor: '#3c5d42',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
