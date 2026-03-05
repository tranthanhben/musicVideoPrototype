import { ThemeToggle } from '@/components/theme-toggle'

export default function CanvasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="cremi" className="relative h-screen overflow-hidden bg-background text-foreground font-[family-name:var(--font-inter)]">
      <div className="absolute top-2 right-2 z-50">
        <ThemeToggle />
      </div>
      {children}
    </div>
  )
}
