'use client'

import { motion } from 'framer-motion'
import { Check, Download, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface VfxPreset {
  label: string
  from: string
  to: string
  description: string
}

export const VFX_PRESETS: VfxPreset[] = [
  { label: 'Cosmic Cinema', from: '#7C3AED', to: '#22D3EE', description: 'Deep purples + cyan' },
  { label: 'Film Noir', from: '#374151', to: '#111827', description: 'High contrast mono' },
  { label: 'Warm Vintage', from: '#F97316', to: '#CA8A04', description: 'Golden film grain' },
  { label: 'Clean Pop', from: '#EC4899', to: '#8B5CF6', description: 'Vibrant saturated' },
]

export interface ExportFormat {
  platform: string
  ratio: string
  label: string
  size: string
  w: number
  h: number
}

export const EXPORT_FORMATS: ExportFormat[] = [
  { platform: 'YouTube', ratio: '16:9', label: 'Full Length', size: '~2.4 GB', w: 16, h: 9 },
  { platform: 'TikTok', ratio: '9:16', label: 'Vertical 60s', size: '~480 MB', w: 9, h: 16 },
  { platform: 'Instagram', ratio: '1:1', label: 'Reels 30s', size: '~240 MB', w: 1, h: 1 },
]

export function EditingVfxPanel({ selectedPreset, onSelect }: { selectedPreset: string; onSelect: (p: string) => void }) {
  return (
    <div className="shrink-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">VFX Preset</p>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {VFX_PRESETS.map((preset) => {
          const isSelected = preset.label === selectedPreset
          return (
            <button key={preset.label} onClick={() => onSelect(preset.label)}
              className={cn(
                'relative rounded-xl border overflow-hidden text-left transition-all cursor-pointer',
                isSelected ? 'border-primary shadow-md' : 'border-border hover:border-primary/40',
              )}
            >
              <div className="h-9 w-full relative"
                style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}>
                {isSelected && <div className="absolute inset-0 bg-white/10" />}
              </div>
              <div className="px-1.5 py-1">
                <p className="text-[9px] font-bold text-foreground leading-tight truncate">{preset.label}</p>
                <p className="text-[8px] text-muted-foreground leading-tight">{preset.description}</p>
              </div>
              {isSelected && (
                <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function EditingExportPanel({ exportedPlatforms, onExport }: {
  exportedPlatforms: Set<string>
  onExport: (platform: string) => void
}) {
  return (
    <div className="shrink-0">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">Export For</p>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => EXPORT_FORMATS.forEach((f) => onExport(f.platform))}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-3 py-1 text-[10px] font-bold text-white shadow cursor-pointer"
        >
          <Download className="h-3 w-3" /> Download All
        </motion.button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {EXPORT_FORMATS.map((fmt) => {
          const isExported = exportedPlatforms.has(fmt.platform)
          const scale = 28 / Math.max(fmt.w, fmt.h)
          return (
            <motion.button key={fmt.platform} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => onExport(fmt.platform)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border p-2.5 cursor-pointer transition-all',
                isExported ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-border bg-card hover:border-primary/40',
              )}
            >
              {isExported ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500">
                  <Check className="h-4 w-4 text-white" />
                </motion.div>
              ) : (
                <div className="flex items-center justify-center" style={{ width: 28, height: 28 }}>
                  <div className="rounded border border-current opacity-50 text-muted-foreground"
                    style={{ width: Math.round(fmt.w * scale), height: Math.round(fmt.h * scale) }} />
                </div>
              )}
              <p className="text-[10px] font-bold text-foreground">{fmt.platform}</p>
              <p className="text-[9px] text-muted-foreground text-center leading-tight">{fmt.ratio} · {fmt.label}</p>
              <p className="text-[8px] text-muted-foreground/60 font-mono">{fmt.size}</p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
