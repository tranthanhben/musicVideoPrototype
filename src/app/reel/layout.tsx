'use client'

export default function ReelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="cremi" className="h-screen overflow-hidden">
      {children}
    </div>
  )
}
