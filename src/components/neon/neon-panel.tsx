import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type GlowColor = 'pink' | 'cyan' | 'yellow'

interface NeonPanelProps {
  children: ReactNode
  glowColor?: GlowColor
  className?: string
  title?: string
}

const glowMap: Record<GlowColor, { border: string; shadow: string; titleColor: string }> = {
  pink: {
    border: 'rgba(255,0,110,0.3)',
    shadow: '0 0 20px rgba(255,0,110,0.15), 0 0 40px rgba(255,0,110,0.08)',
    titleColor: '#FF006E',
  },
  cyan: {
    border: 'rgba(0,245,212,0.3)',
    shadow: '0 0 20px rgba(0,245,212,0.15), 0 0 40px rgba(0,245,212,0.08)',
    titleColor: '#00F5D4',
  },
  yellow: {
    border: 'rgba(254,228,64,0.3)',
    shadow: '0 0 20px rgba(254,228,64,0.15), 0 0 40px rgba(254,228,64,0.08)',
    titleColor: '#FEE440',
  },
}

export function NeonPanel({ children, glowColor = 'pink', className, title }: NeonPanelProps) {
  const glow = glowMap[glowColor]

  return (
    <div
      className={cn('rounded-xl overflow-hidden', className)}
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${glow.border}`,
        boxShadow: glow.shadow,
      }}
    >
      {title && (
        <div
          className="px-4 py-2 text-xs font-semibold uppercase tracking-widest border-b"
          style={{
            color: glow.titleColor,
            borderColor: glow.border,
            fontFamily: 'var(--font-space-grotesk, "Space Grotesk", sans-serif)',
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  )
}
