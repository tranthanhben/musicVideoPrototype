export default function ControlLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="cremi" className="h-screen overflow-hidden bg-background text-foreground font-[family-name:var(--font-inter)]">
      {children}
    </div>
  )
}
