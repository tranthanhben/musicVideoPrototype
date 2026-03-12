import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Editing Bay' }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
