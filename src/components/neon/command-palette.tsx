'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FolderOpen, LayoutDashboard, Play, ArrowRight } from 'lucide-react'

interface Action {
  id: string
  label: string
  icon: React.ReactNode
  shortcut?: string
  href?: string
  action?: string
}

const ALL_ACTIONS: Action[] = [
  { id: 'new', label: 'New Project', icon: <ArrowRight size={14} />, shortcut: '⌘N', action: 'new-project' },
  { id: 'open-cosmic', label: 'Open Project: Cosmic Love Story', icon: <FolderOpen size={14} />, href: '/neon/workspace?id=project-cosmic' },
  { id: 'open-neon', label: 'Open Project: Neon City Nights', icon: <FolderOpen size={14} />, href: '/neon/workspace?id=project-neon' },
  { id: 'open-ocean', label: 'Open Project: Ocean Dreams', icon: <FolderOpen size={14} />, href: '/neon/workspace?id=project-ocean' },
  { id: 'launchpad', label: 'Go to Launchpad', icon: <LayoutDashboard size={14} />, shortcut: '⌘H', href: '/neon' },
  { id: 'showcase', label: 'Go to Showcase', icon: <Play size={14} />, href: '/neon/showcase' },
]

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onAction: (action: string) => void
}

export function CommandPalette({ isOpen, onClose, onAction }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = ALL_ACTIONS.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handleSelect = useCallback((item: Action) => {
    if (item.href) {
      router.push(item.href)
    } else if (item.action) {
      onAction(item.action)
    }
    onClose()
  }, [router, onAction, onClose])

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && filtered[activeIndex]) { handleSelect(filtered[activeIndex]) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, filtered, activeIndex, handleSelect, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-xl"
            style={{
              background: 'rgba(10,10,15,0.95)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,0,110,0.4)',
              boxShadow: '0 0 40px rgba(255,0,110,0.2), 0 0 80px rgba(0,245,212,0.1)',
            }}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Search row */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(255,0,110,0.2)]">
              <Search size={16} className="text-[#FF006E] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search actions..."
                className="flex-1 bg-transparent text-[#EEEEF0] placeholder-[#888899] text-sm outline-none"
                style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
              />
              <kbd className="text-[10px] text-[#888899] bg-[rgba(255,255,255,0.05)] rounded px-1.5 py-0.5">ESC</kbd>
            </div>

            {/* Actions list */}
            <div className="py-2 max-h-72 overflow-y-auto">
              {filtered.length === 0 && (
                <p className="text-center text-[#888899] text-sm py-6">No results</p>
              )}
              {filtered.map((item, idx) => (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                  style={{
                    background: idx === activeIndex ? 'rgba(255,0,110,0.1)' : 'transparent',
                    color: idx === activeIndex ? '#FF006E' : '#EEEEF0',
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => handleSelect(item)}
                >
                  <span className="shrink-0 opacity-70">{item.icon}</span>
                  <span className="flex-1 text-sm">{item.label}</span>
                  {item.shortcut && (
                    <kbd className="text-[10px] text-[#888899] bg-[rgba(255,255,255,0.05)] rounded px-1.5 py-0.5">
                      {item.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-4 px-4 py-2 border-t border-[rgba(255,0,110,0.1)] text-[10px] text-[#888899]">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>ESC close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
