'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Command, Search, RefreshCw, Camera, Palette, Plus, Download, Cpu, CheckCircle, Edit3, FolderPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  icon: React.ReactNode
  name: string
  description: string
  action: string
}

const COMMANDS: CommandItem[] = [
  { id: 'approve', icon: <CheckCircle className="h-4 w-4" />, name: 'Approve stage', description: 'Approve current quality gate and advance', action: 'approve' },
  { id: 'revise', icon: <Edit3 className="h-4 w-4" />, name: 'Request revision', description: 'Send current stage back for revision', action: 'revise' },
  { id: 'regenerate', icon: <RefreshCw className="h-4 w-4" />, name: 'Regenerate scene', description: 'Re-run generation for selected scene', action: 'show_regen_options' },
  { id: 'export', icon: <Download className="h-4 w-4" />, name: 'Export video', description: 'Export the final assembled video', action: 'download' },
  { id: 'new-project', icon: <FolderPlus className="h-4 w-4" />, name: 'New project', description: 'Start a new video project', action: 'new_project' },
  { id: 'camera', icon: <Camera className="h-4 w-4" />, name: 'Change camera angle', description: 'Update camera for selected scene', action: '' },
  { id: 'palette', icon: <Palette className="h-4 w-4" />, name: 'Adjust color palette', description: 'Modify the creative direction colors', action: '' },
  { id: 'add-scene', icon: <Plus className="h-4 w-4" />, name: 'Add scene', description: 'Insert a new scene after current', action: '' },
  { id: 'model', icon: <Cpu className="h-4 w-4" />, name: 'Switch model', description: 'Change the AI generation model', action: '' },
]

interface ReelCommandPaletteProps {
  open: boolean
  onClose: () => void
  onAction?: (action: string) => void
}

export function ReelCommandPalette({ open, onClose, onAction }: ReelCommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const filtered = COMMANDS.filter(
    (c) =>
      query.trim() === '' ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
  )

  function handleSelect(cmd: CommandItem) {
    setFeedback(cmd.name)
    if (cmd.action && onAction) {
      onAction(cmd.action)
    }
    setTimeout(() => {
      setFeedback(null)
      setQuery('')
      onClose()
    }, 800)
  }

  function handleBackdropClick() {
    setQuery('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="command-palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Command className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search commands..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>

            {/* Command list */}
            <div className="max-h-72 overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">No commands found</p>
              ) : (
                filtered.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition-colors',
                      feedback === cmd.name && 'bg-primary/10'
                    )}
                  >
                    <span className="text-muted-foreground shrink-0">{cmd.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{cmd.name}</p>
                      <p className="text-xs text-muted-foreground">{cmd.description}</p>
                    </div>
                    {feedback === cmd.name && (
                      <span className="ml-auto text-xs text-primary font-medium">Done</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
