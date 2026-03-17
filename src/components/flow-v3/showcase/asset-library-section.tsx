'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Search, ChevronDown, Image, Video, Music, User, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ShowcaseSection } from './showcase-section-wrapper'

const TABS = ['All', 'Images', 'Videos', 'Audio', 'Characters'] as const
type Tab = typeof TABS[number]

const assets = [
  { id: 1, name: 'Cityscape Night', type: 'Image', meta: '1920×1080', date: '2d ago', gradient: 'from-blue-900 to-cyan-900', accent: 'text-blue-400 bg-blue-900/50' },
  { id: 2, name: 'Smoke Loop', type: 'Video', meta: '0:04', date: '3d ago', gradient: 'from-purple-900 to-violet-900', accent: 'text-purple-400 bg-purple-900/50' },
  { id: 3, name: 'Deep Bass', type: 'Audio', meta: '3:42', date: '4d ago', gradient: 'from-pink-900 to-rose-900', accent: 'text-pink-400 bg-pink-900/50' },
  { id: 4, name: 'Aria Character', type: 'Character', meta: 'Used in 3 projects', date: '1w ago', gradient: 'from-amber-900 to-yellow-900', accent: 'text-amber-400 bg-amber-900/50' },
  { id: 5, name: 'Forest Dawn', type: 'Image', meta: '1920×1080', date: '1w ago', gradient: 'from-emerald-900 to-teal-900', accent: 'text-blue-400 bg-blue-900/50' },
  { id: 6, name: 'Rain Overlay', type: 'Video', meta: '0:08', date: '2w ago', gradient: 'from-slate-900 to-blue-900', accent: 'text-purple-400 bg-purple-900/50' },
  { id: 7, name: 'Synth Pad', type: 'Audio', meta: '1:15', date: '2w ago', gradient: 'from-fuchsia-900 to-purple-900', accent: 'text-pink-400 bg-pink-900/50' },
  { id: 8, name: 'Kael Character', type: 'Character', meta: 'Used in 1 project', date: '3w ago', gradient: 'from-cyan-900 to-blue-900', accent: 'text-amber-400 bg-amber-900/50' },
  { id: 9, name: 'Lens Flare', type: 'Image', meta: '3840×2160', date: '1mo ago', gradient: 'from-orange-900 to-amber-900', accent: 'text-blue-400 bg-blue-900/50' },
]

const typeIcon: Record<string, React.ReactNode> = {
  Image: <Image className="h-3 w-3" />,
  Video: <Video className="h-3 w-3" />,
  Audio: <Music className="h-3 w-3" />,
  Character: <User className="h-3 w-3" />,
}

export function AssetLibrarySection() {
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const [search, setSearch] = useState('')

  const filtered = assets.filter((a) => {
    const TAB_TYPE: Record<Tab, string | null> = { All: null, Images: 'Image', Videos: 'Video', Audio: 'Audio', Characters: 'Character' }
    const matchesTab = activeTab === 'All' || a.type === TAB_TYPE[activeTab]
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <ShowcaseSection
      id="asset-library"
      title="Asset Library"
      description="Browse, upload, and organize all your creative assets"
      icon={<FolderOpen className="h-4 w-4 text-primary" />}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] text-muted-foreground cursor-pointer hover:border-primary/40">
          Newest <ChevronDown className="h-3 w-3 ml-1" />
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Upload className="h-3 w-3" /> Upload
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border mb-3">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-3 py-1.5 text-[11px] font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {filtered.map((asset, i) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            className="group cursor-pointer rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-colors"
          >
            <div className={cn('h-14 bg-gradient-to-br', asset.gradient, 'flex items-center justify-center')}>
              <div className="text-white/20">{typeIcon[asset.type]}</div>
            </div>
            <div className="p-2 bg-card">
              <div className="flex items-center gap-1 mb-1">
                <span className={cn('rounded px-1 py-0.5 text-[9px] font-medium flex items-center gap-0.5', asset.accent)}>
                  {typeIcon[asset.type]} {asset.type}
                </span>
              </div>
              <p className="text-[10px] font-medium text-foreground truncate">{asset.name}</p>
              <p className="text-[9px] text-muted-foreground">{asset.meta}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </ShowcaseSection>
  )
}
