import { cn } from '@/lib/utils'

interface ChromeTextProps {
  children: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'span'
}

export function ChromeText({ children, className, as: Tag = 'h1' }: ChromeTextProps) {
  return (
    <Tag
      className={cn('font-bold', className)}
      style={{
        fontFamily: 'var(--font-space-grotesk, "Space Grotesk", sans-serif)',
        background: 'linear-gradient(135deg, #FF006E 0%, #00F5D4 40%, #FEE440 70%, #FF006E 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        filter: 'drop-shadow(0 0 12px rgba(255,0,110,0.4))',
      }}
    >
      {children}
    </Tag>
  )
}
