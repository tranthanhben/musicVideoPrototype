'use client'

import { motion } from 'framer-motion'
import { Plus, Film, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ShowcaseSection } from './showcase-section-wrapper'

const projects = [
  { id: 1, name: 'Midnight Dreams MV', artist: 'Luna Eclipse', scenes: 12, status: 'Complete', edited: '2h ago', gradient: 'from-indigo-900 to-purple-900' },
  { id: 2, name: 'Solar Flare', artist: 'Kael Voss', scenes: 8, status: 'Generating', edited: '5m ago', gradient: 'from-amber-900 to-orange-900' },
  { id: 3, name: 'Neon Pulse', artist: 'Aria Synn', scenes: 15, status: 'Draft', edited: '1d ago', gradient: 'from-cyan-900 to-blue-900' },
  { id: 4, name: 'Ocean Drift', artist: 'Marcus Wave', scenes: 10, status: 'Exported', edited: '3d ago', gradient: 'from-teal-900 to-emerald-900' },
  { id: 5, name: 'Crimson Sky', artist: 'Zara Red', scenes: 6, status: 'Draft', edited: '1w ago', gradient: 'from-rose-900 to-red-900' },
  { id: 6, name: 'Electric Dawn', artist: 'The Circuit', scenes: 18, status: 'Complete', edited: '2w ago', gradient: 'from-violet-900 to-fuchsia-900' },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  Draft: { label: 'Draft', className: 'bg-zinc-700 text-zinc-300' },
  Generating: { label: 'Generating', className: 'bg-amber-900/60 text-amber-300' },
  Complete: { label: 'Complete', className: 'bg-emerald-900/60 text-emerald-300' },
  Exported: { label: 'Exported', className: 'bg-blue-900/60 text-blue-300' },
}

export function ProjectDashboardSection() {
  return (
    <ShowcaseSection
      id="project-dashboard"
      title="Project Dashboard"
      description="Manage and track all your music video projects"
      icon={<LayoutGrid className="h-4 w-4 text-primary" />}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="group cursor-pointer rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-colors"
          >
            <div className={cn('h-20 bg-gradient-to-br', project.gradient, 'flex items-center justify-center')}>
              <Film className="h-6 w-6 text-white/30" />
            </div>
            <div className="p-2.5 bg-card">
              <div className="flex items-start justify-between gap-1 mb-1">
                <p className="text-[11px] font-semibold text-foreground leading-tight truncate">{project.name}</p>
                <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium', statusConfig[project.status].className)}>
                  {project.status === 'Generating' ? (
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      {statusConfig[project.status].label}
                    </span>
                  ) : statusConfig[project.status].label}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-1 truncate">{project.artist}</p>
              <div className="flex items-center justify-between text-[9px] text-muted-foreground/70">
                <span>{project.scenes} scenes</span>
                <span>{project.edited}</span>
              </div>
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="cursor-pointer rounded-lg border border-dashed border-border hover:border-primary/60 transition-colors flex flex-col items-center justify-center gap-2 p-6 text-muted-foreground hover:text-primary min-h-[140px]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-current">
            <Plus className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-medium">Create New Project</span>
        </motion.div>
      </div>
    </ShowcaseSection>
  )
}
