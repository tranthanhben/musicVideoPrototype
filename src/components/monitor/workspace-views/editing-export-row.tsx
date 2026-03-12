'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExportCard {
  platform: string
  format: string
  ratio: [number, number]
}

const EXPORT_CARDS: ExportCard[] = [
  { platform: 'YouTube', format: '16:9 Full Length', ratio: [32, 18] },
  { platform: 'TikTok', format: '9:16 Vertical 60s', ratio: [18, 32] },
  { platform: 'Instagram', format: '9:16 Reels 30s', ratio: [18, 32] },
]

function AspectIcon({ ratio }: { ratio: [number, number] }) {
  const [w, h] = ratio
  const scale = 28 / Math.max(w, h)
  return (
    <div className="flex items-center justify-center" style={{ width: 28, height: 28 }}>
      <div className="rounded border border-current opacity-60"
        style={{ width: Math.round(w * scale), height: Math.round(h * scale) }} />
    </div>
  )
}

function Confetti() {
  const colors = ['#7C3AED', '#22D3EE', '#EC4899', '#F59E0B', '#10B981']
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 24 }, (_, i) => (
        <motion.div key={i} className="absolute h-2 w-2 rounded-sm"
          style={{ backgroundColor: colors[i % colors.length], left: `${(i * 4.2) % 100}%`, top: '-10px' }}
          animate={{ y: ['0px', '120%'], rotate: [0, 360 * (i % 2 ? 1 : -1)], opacity: [1, 0] }}
          transition={{ duration: 1.2 + (i % 4) * 0.2, delay: i * 0.04, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

interface EditingExportRowProps {
  onDownloadAll: () => void
}

export function EditingExportRow({ onDownloadAll }: EditingExportRowProps) {
  const [exportedPlatform, setExportedPlatform] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  function handleExport(platform: string) {
    setExportedPlatform(platform)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 1500)
  }

  function handleDownloadAll() {
    setExportedPlatform('all')
    setShowConfetti(true)
    onDownloadAll()
    setTimeout(() => setShowConfetti(false), 1500)
  }

  return (
    <div className="relative shrink-0">
      {showConfetti && <Confetti />}
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">Export For</p>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDownloadAll}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-3 py-1 text-[10px] font-bold text-white shadow cursor-pointer"
        >
          <Download className="h-3 w-3" /> Download All
        </motion.button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {EXPORT_CARDS.map((card) => {
          const isExported = exportedPlatform === card.platform || exportedPlatform === 'all'
          return (
            <motion.button
              key={card.platform}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleExport(card.platform)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border p-2.5 cursor-pointer transition-all overflow-hidden',
                isExported ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-border bg-card hover:border-primary/40',
              )}
            >
              <AnimatePresence mode="wait">
                {isExported ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500">
                    <Check className="h-4 w-4 text-white" />
                  </motion.div>
                ) : (
                  <motion.div key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="text-muted-foreground">
                    <AspectIcon ratio={card.ratio} />
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="text-[10px] font-bold text-foreground">{card.platform}</p>
              <p className="text-[9px] text-muted-foreground text-center leading-tight">{card.format}</p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
