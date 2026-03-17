export default function FlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="cremi" className="relative min-h-screen bg-background text-foreground font-[family-name:var(--font-inter)]">
      {children}
    </div>
  )
}
