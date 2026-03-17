'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Sparkles, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ShowcaseSection } from './showcase-section-wrapper'

const formats = [
  { id: 'mp4', label: 'MP4', codec: 'H.264' },
  { id: 'mov', label: 'MOV', codec: 'H.265' },
  { id: 'webm', label: 'WebM', codec: 'VP9' },
]

const qualities = [
  { id: '480p', label: 'SD 480p', size: '~120 MB' },
  { id: '720p', label: 'HD 720p', size: '~280 MB' },
  { id: '1080p', label: 'Full HD 1080p', size: '~680 MB' },
  { id: '1440p', label: '2K 1440p', size: '~1.4 GB' },
  { id: '2160p', label: '4K 2160p', size: '~3.2 GB' },
]

const frameRates = ['24fps', '30fps', '60fps']
const audioOptions = ['AAC 128kbps', 'AAC 256kbps', 'WAV Lossless']

const creditCosts: Record<string, number> = { '480p': 30, '720p': 60, '1080p': 100, '1440p': 180, '2160p': 300 }

export function ExportSettingsSection() {
  const [format, setFormat] = useState('mp4')
  const [quality, setQuality] = useState('1080p')
  const [fps, setFps] = useState('30fps')
  const [audio, setAudio] = useState('AAC 256kbps')
  const [watermark, setWatermark] = useState(false)

  const selectedFormat = formats.find((f) => f.id === format)!
  const selectedQuality = qualities.find((q) => q.id === quality)!

  return (
    <ShowcaseSection
      id="export-settings"
      title="Export Settings"
      description="Configure format, quality, and codec for your final render"
      icon={<Download className="h-4 w-4 text-primary" />}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-4">
        {/* Format */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Format</p>
          <div className="flex gap-2">
            {formats.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={cn(
                  'flex-1 rounded-lg border py-2 text-[11px] font-semibold transition-all',
                  format === f.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40',
                )}
              >
                {f.label}
                <span className="block text-[9px] font-normal opacity-70">{f.codec}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quality */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quality</p>
          <div className="grid grid-cols-5 gap-1.5">
            {qualities.map((q) => (
              <button
                key={q.id}
                onClick={() => setQuality(q.id)}
                className={cn(
                  'rounded-lg border py-1.5 text-center transition-all',
                  quality === q.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40',
                )}
              >
                <p className={cn('text-[10px] font-semibold', quality === q.id ? 'text-primary' : 'text-foreground')}>{q.id}</p>
                <p className="text-[8px] text-muted-foreground">{q.label.split(' ')[0]}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Frame Rate & Audio */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Frame Rate</p>
            <div className="flex gap-1.5">
              {frameRates.map((r) => (
                <button
                  key={r}
                  onClick={() => setFps(r)}
                  className={cn(
                    'flex-1 rounded-lg border py-1.5 text-[10px] font-medium transition-all',
                    fps === r ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Audio</p>
            <div className="flex flex-col gap-1">
              {audioOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAudio(opt)}
                  className={cn(
                    'rounded-lg border px-2 py-1 text-[10px] text-left transition-all',
                    audio === opt ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40',
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Watermark toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div className="flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-[11px] font-medium text-foreground">Watermark</p>
              <p className="text-[9px] text-muted-foreground">Add brand watermark to export</p>
            </div>
          </div>
          <button
            onClick={() => setWatermark(!watermark)}
            role="switch"
            aria-checked={watermark}
            className={cn('h-5 w-9 rounded-full transition-all relative', watermark ? 'bg-primary' : 'bg-zinc-700')}
          >
            <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all shadow', watermark ? 'left-4' : 'left-0.5')} />
          </button>
        </div>

        {/* Size & Cost summary */}
        <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
          <span className="text-[11px] text-muted-foreground">Est. file size: <span className="text-foreground font-medium">{selectedQuality.size}</span></span>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span className="text-[11px] text-amber-400 font-semibold">{creditCosts[quality]} credits</span>
          </div>
        </div>

        {/* Export button */}
        <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          <Download className="h-3.5 w-3.5" />
          Export {selectedFormat.label} · {quality}
        </button>
      </motion.div>
    </ShowcaseSection>
  )
}
