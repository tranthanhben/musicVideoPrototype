export default function ScreeningLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="cremi" className="min-h-screen bg-background text-foreground font-[family-name:var(--font-inter)]">
      {children}
    </div>
  )
}
