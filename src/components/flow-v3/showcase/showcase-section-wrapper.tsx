'use client'

import { cn } from '@/lib/utils'

interface ShowcaseSectionProps {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function ShowcaseSection({ id, title, description, icon, children, className }: ShowcaseSectionProps) {
  return (
    <section id={id} className={cn('scroll-mt-20', className)}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">{icon}</div>
        <div>
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          <p className="text-[10px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card/50 p-4">{children}</div>
    </section>
  )
}
