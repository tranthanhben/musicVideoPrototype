'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MV_TYPES } from '@/lib/flow-v2/mock-data'
import type { MvType } from '@/lib/flow-v2/types'

interface MvTypeStepProps {
  selected: MvType | null
  onSelect: (type: MvType) => void
}

function VinylRecord({ colors, isSelected }: { colors: string[]; isSelected: boolean }) {
  return (
    <div className="relative w-24 h-24 md:w-28 md:h-28">
      {/* SVG vinyl */}
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        {/* Outer disc */}
        <defs>
          <radialGradient id={`vinyl-${colors[0].replace('#','')}`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#444" />
            <stop offset="100%" stopColor="#111" />
          </radialGradient>
          <linearGradient id={`center-${colors[0].replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
          <clipPath id={`clip-${colors[0].replace('#','')}`}>
            <circle cx="100" cy="100" r="58" />
          </clipPath>
        </defs>

        {/* Vinyl body */}
        <circle cx="100" cy="100" r="98" fill={`url(#vinyl-${colors[0].replace('#','')})`} />

        {/* Outer metallic rim */}
        <circle cx="100" cy="100" r="98" fill="none" stroke="#555" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="95" fill="none" stroke="#333" strokeWidth="0.5" />

        {/* Grooves */}
        {[...Array(12)].map((_, i) => (
          <circle
            key={i}
            cx="100"
            cy="100"
            r={65 + i * 2.5}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.5"
          />
        ))}

        {/* Inner metallic ring around center image */}
        <circle cx="100" cy="100" r="61" fill="none" stroke="#666" strokeWidth="2.5" />
        <circle cx="100" cy="100" r="59.5" fill="none" stroke="#444" strokeWidth="0.5" />

        {/* Center image area with gradient */}
        <circle cx="100" cy="100" r="58" fill={`url(#center-${colors[0].replace('#','')})`} />

        {/* Simulated image content - abstract shapes */}
        <g clipPath={`url(#clip-${colors[0].replace('#','')})`} opacity="0.4">
          <circle cx="80" cy="80" r="25" fill="rgba(255,255,255,0.15)" />
          <circle cx="120" cy="110" r="20" fill="rgba(255,255,255,0.1)" />
          <rect x="70" y="100" width="60" height="30" rx="8" fill="rgba(0,0,0,0.15)" />
        </g>

        {/* Shine on center */}
        <circle cx="100" cy="100" r="58" fill="url(#shineGrad)" opacity="0.3" />

        {/* Center hole */}
        <circle cx="100" cy="100" r="6" fill="#0a0a12" />
        <circle cx="100" cy="100" r="6" fill="none" stroke="#333" strokeWidth="1" />
        {/* Hole highlight */}
        <circle cx="99" cy="99" r="3" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      </svg>

      {/* Selected glow */}
      {isSelected && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `0 0 40px ${colors[0]}60, 0 0 80px ${colors[0]}30`,
          }}
        />
      )}
    </div>
  )
}

export function MvTypeStep({ selected, onSelect }: MvTypeStepProps) {
  return (
    <div
      className="flex h-full items-center justify-center p-6 overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #080620 0%, #0e0a30 30%, #0c1535 60%, #070e24 100%)',
      }}
    >
      {/* Global SVG defs */}
      <svg className="absolute w-0 h-0">
        <defs>
          <radialGradient id="shineGrad" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      <div className="w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Choose the type of video<br />you would like to create:
          </h2>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {/* Row 1: first 3 vinyls */}
          <div className="flex items-start justify-center gap-4 md:gap-8 lg:gap-12">
            {MV_TYPES.slice(0, 3).map((type, i) => {
              const isSelected = selected === type.id
              return (
                <motion.button
                  key={type.id}
                  onClick={() => onSelect(type.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className={cn(
                    'flex flex-col items-center cursor-pointer group',
                    'transition-transform duration-300',
                    isSelected ? 'scale-105' : 'hover:scale-105',
                  )}
                >
                  <div className={cn(
                    'transition-all duration-500',
                    isSelected ? '[transform:rotate(8deg)]' : 'group-hover:[transform:rotate(4deg)]',
                  )}>
                    <VinylRecord colors={type.vinylColors} isSelected={isSelected} />
                  </div>
                  <div className="text-center mt-5 max-w-[11rem]">
                    <p className={cn(
                      'text-sm font-bold transition-colors duration-200',
                      isSelected ? 'text-white' : 'text-white/80 group-hover:text-white',
                    )}>
                      {type.label}
                    </p>
                    <p className={cn(
                      'text-xs mt-1.5 leading-relaxed transition-colors duration-200',
                      isSelected ? 'text-white/70' : 'text-white/40 group-hover:text-white/60',
                    )}>
                      {type.description}
                    </p>
                  </div>
                </motion.button>
              )
            })}
          </div>
          {/* Row 2: remaining vinyls */}
          <div className="flex items-start justify-center gap-4 md:gap-8 lg:gap-12">
            {MV_TYPES.slice(3).map((type, i) => {
              const isSelected = selected === type.id
              return (
                <motion.button
                  key={type.id}
                  onClick={() => onSelect(type.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.44 + i * 0.08 }}
                  className={cn(
                    'flex flex-col items-center cursor-pointer group',
                    'transition-transform duration-300',
                    isSelected ? 'scale-105' : 'hover:scale-105',
                  )}
                >
                  <div className={cn(
                    'transition-all duration-500',
                    isSelected ? '[transform:rotate(8deg)]' : 'group-hover:[transform:rotate(4deg)]',
                  )}>
                    <VinylRecord colors={type.vinylColors} isSelected={isSelected} />
                  </div>
                  <div className="text-center mt-5 max-w-[11rem]">
                    <p className={cn(
                      'text-sm font-bold transition-colors duration-200',
                      isSelected ? 'text-white' : 'text-white/80 group-hover:text-white',
                    )}>
                      {type.label}
                    </p>
                    <p className={cn(
                      'text-xs mt-1.5 leading-relaxed transition-colors duration-200',
                      isSelected ? 'text-white/70' : 'text-white/40 group-hover:text-white/60',
                    )}>
                      {type.description}
                    </p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
