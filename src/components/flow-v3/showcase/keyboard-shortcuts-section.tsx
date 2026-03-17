'use client'

import { motion } from 'framer-motion'
import { Keyboard } from 'lucide-react'
import { ShowcaseSection } from './showcase-section-wrapper'
import { cn } from '@/lib/utils'

interface Shortcut {
  keys: string[]
  description: string
}

interface Group {
  label: string
  shortcuts: Shortcut[]
}

const GROUPS: Group[] = [
  {
    label: 'General',
    shortcuts: [
      { keys: ['Ctrl', 'S'],   description: 'Save project' },
      { keys: ['Ctrl', 'Z'],   description: 'Undo' },
      { keys: ['Ctrl', 'Y'],   description: 'Redo' },
      { keys: ['Ctrl', 'N'],   description: 'New project' },
      { keys: ['Ctrl', 'E'],   description: 'Export' },
    ],
  },
  {
    label: 'Editor',
    shortcuts: [
      { keys: ['Delete'],      description: 'Remove scene' },
      { keys: ['Ctrl', 'D'],   description: 'Duplicate scene' },
      { keys: ['Ctrl', 'A'],   description: 'Select all' },
      { keys: ['['],           description: 'Trim start' },
      { keys: [']'],           description: 'Trim end' },
    ],
  },
  {
    label: 'Playback',
    shortcuts: [
      { keys: ['Space'],       description: 'Play / Pause' },
      { keys: ['←'],           description: 'Previous scene' },
      { keys: ['→'],           description: 'Next scene' },
      { keys: ['Ctrl', '←'],   description: 'Skip back 5s' },
      { keys: ['Ctrl', '→'],   description: 'Skip forward 5s' },
      { keys: ['Home'],        description: 'Go to start' },
      { keys: ['End'],         description: 'Go to end' },
    ],
  },
  {
    label: 'Navigation',
    shortcuts: [
      { keys: ['1–5'],         description: 'Jump to step' },
      { keys: ['Ctrl', '/'],   description: 'Command palette' },
      { keys: ['Tab'],         description: 'Next field' },
      { keys: ['Esc'],         description: 'Close panel' },
    ],
  },
]

function Key({ label }: { label: string }) {
  return (
    <kbd className="inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 leading-none">
      {label}
    </kbd>
  )
}

export function KeyboardShortcutsSection() {
  return (
    <ShowcaseSection
      id="keyboard-shortcuts"
      title="Keyboard Shortcuts"
      description="Quick reference for all keyboard shortcuts"
      icon={<Keyboard className="h-4 w-4 text-primary" />}
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {GROUPS.map((group, gi) => (
          <motion.div
            key={group.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.08 }}
          >
            <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-2">{group.label}</p>
            <div className="space-y-1">
              {group.shortcuts.map((s, si) => (
                <motion.div
                  key={si}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: gi * 0.08 + si * 0.03 }}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-zinc-800/50 transition-colors group"
                >
                  <span className="text-[11px] text-zinc-400 group-hover:text-zinc-300 transition-colors">{s.description}</span>
                  <div className="flex items-center gap-0.5 ml-3 shrink-0">
                    {s.keys.map((k, ki) => (
                      <span key={ki} className="flex items-center gap-0.5">
                        <Key label={k} />
                        {ki < s.keys.length - 1 && <span className="text-[9px] text-zinc-700 mx-0.5">+</span>}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </ShowcaseSection>
  )
}
