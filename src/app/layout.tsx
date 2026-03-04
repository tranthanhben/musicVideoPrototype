import type { Metadata } from 'next'
import {
  Inter,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  IBM_Plex_Mono,
  Space_Grotesk,
  Playfair_Display,
  Source_Sans_3,
} from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
})

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair-display',
  subsets: ['latin'],
})

const sourceSans3 = Source_Sans_3({
  variable: '--font-source-sans-3',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Cremi - UI/UX Prototypes',
  description: '5 prototype demos for AI music video creation',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const fontVars = [
    inter.variable,
    jetbrainsMono.variable,
    plusJakartaSans.variable,
    ibmPlexMono.variable,
    spaceGrotesk.variable,
    playfairDisplay.variable,
    sourceSans3.variable,
  ].join(' ')

  return (
    <html lang="en">
      <body className={`${fontVars} antialiased`}>{children}</body>
    </html>
  )
}
