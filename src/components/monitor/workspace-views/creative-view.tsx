'use client'

import { cn } from '@/lib/utils'

interface StyleCard {
  label: string
  from: string
  to: string
  direction: string
}

const STYLE_CARDS: StyleCard[] = [
  { label: 'Cinematic', from: '#7C3AED', to: '#22D3EE', direction: '135deg' },
  { label: 'Ethereal', from: '#A855F7', to: '#EC4899', direction: '135deg' },
  { label: 'Noir', from: '#1E293B', to: '#475569', direction: '135deg' },
  { label: 'Cosmic', from: '#06B6D4', to: '#7C3AED', direction: '45deg' },
  { label: 'Warm Glow', from: '#F59E0B', to: '#EF4444', direction: '135deg' },
  { label: 'Dream Pop', from: '#EC4899', to: '#8B5CF6', direction: '45deg' },
]

function GradientThumb({ from, to, direction, label }: StyleCard) {
  return (
    <div className="group relative overflow-hidden rounded-xl aspect-[4/3] cursor-pointer">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient
            id={`grad-${label}`}
            x1="0%"
            y1="0%"
            x2={direction === '135deg' ? '100%' : '0%'}
            y2="100%"
          >
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grad-${label})`} />
      </svg>
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
      <div className="absolute inset-0 flex items-end p-3">
        <span className="text-xs font-semibold text-white drop-shadow">{label}</span>
      </div>
    </div>
  )
}

export function CreativeView() {
  return (
    <div className="flex h-full flex-col p-6 gap-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Mood Board</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Creative direction styles being explored</p>
      </div>

      <div className={cn('grid grid-cols-3 gap-3 flex-1 content-start')}>
        {STYLE_CARDS.map((card) => (
          <GradientThumb key={card.label} {...card} />
        ))}
      </div>
    </div>
  )
}
