'use client'

import { cn } from '@/lib/utils'

interface GenerationLoadingProps {
  progress: number
  message: string
  variant?: 'default' | 'neon' | 'minimal'
}

const SIZE = 120
const RADIUS = 48
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function GenerationLoading({
  progress,
  message,
  variant = 'default',
}: GenerationLoadingProps) {
  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE

  const trackColor =
    variant === 'neon'
      ? 'rgba(255,0,110,0.2)'
      : variant === 'minimal'
      ? '#e4e4e7'
      : 'rgba(255,255,255,0.1)'

  const progressColor =
    variant === 'neon'
      ? '#FF006E'
      : variant === 'minimal'
      ? '#18181b'
      : 'var(--primary, #7C3AED)'

  const textColor = 'text-foreground'

  const wrapperClass = cn(
    'flex flex-col items-center gap-4',
    variant === 'neon' && 'animate-pulse'
  )

  return (
    <div className={wrapperClass}>
      {/* Circular progress */}
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={trackColor}
            strokeWidth="6"
          />
          {/* Progress arc */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={progressColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-300 ease-out"
          />
        </svg>

        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-2xl font-bold tabular-nums', textColor)}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Message */}
      <p className={cn('text-sm text-center max-w-[180px]', textColor, 'opacity-80')}>
        {message}
      </p>
    </div>
  )
}
