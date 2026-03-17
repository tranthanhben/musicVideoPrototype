'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, Pause, X, ChevronUp, Layers, ListVideo } from 'lucide-react'
import { ShowcaseSection } from './showcase-section-wrapper'
import { cn } from '@/lib/utils'

type JobStatus = 'active' | 'queued' | 'completed'

interface Job {
  id: number
  project: string
  scenes: string
  status: JobStatus
  progress?: number
  eta?: string
  completedAt?: string
}

const INITIAL_JOBS: Job[] = [
  { id: 1, project: 'Solar Flare',     scenes: 'Scene 24/39', status: 'active',    progress: 62, eta: '~3 min remaining' },
  { id: 2, project: 'Neon Pulse',      scenes: 'Scene 8/12',  status: 'active',    progress: 45, eta: '~5 min remaining' },
  { id: 3, project: 'Ocean Drift',     scenes: '20 scenes',   status: 'queued' },
  { id: 4, project: 'Midnight Dreams', scenes: '39 scenes',   status: 'completed', completedAt: 'Completed 10 min ago' },
  { id: 5, project: 'Crimson Sky',     scenes: '15 scenes',   status: 'completed', completedAt: 'Completed 1 hr ago' },
]

const STATUS_COLORS: Record<JobStatus, string> = {
  active:    'text-blue-400',
  queued:    'text-amber-400',
  completed: 'text-emerald-400',
}

export function GenerationQueueSection() {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS)

  const active    = jobs.filter(j => j.status === 'active')
  const queued    = jobs.filter(j => j.status === 'queued')
  const completed = jobs.filter(j => j.status === 'completed')

  const cancelJob = (id: number) => setJobs(prev => prev.filter(j => j.id !== id))
  const cancelAll = () => setJobs(prev => prev.filter(j => j.status === 'completed'))
  const priorityUp = (id: number) => {
    setJobs(prev => {
      const queuedItems = prev.filter(j => j.status === 'queued')
      const idx = queuedItems.findIndex(j => j.id === id)
      if (idx <= 0) return prev
      const newQueued = [...queuedItems]
      ;[newQueued[idx - 1], newQueued[idx]] = [newQueued[idx], newQueued[idx - 1]]
      return prev.map(j => {
        const found = newQueued.find(q => q.id === j.id)
        return found ?? j
      }).sort((a, b) => {
        const order: JobStatus[] = ['active', 'queued', 'completed']
        return order.indexOf(a.status) - order.indexOf(b.status)
      })
    })
  }

  return (
    <ShowcaseSection
      id="generation-queue"
      title="Generation Queue"
      description="Monitor and manage active video generation jobs"
      icon={<ListVideo className="h-4 w-4 text-primary" />}
    >
      {/* Summary bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 text-[11px]">
          <span><span className="font-semibold text-blue-400">{active.length} active</span></span>
          <span className="text-zinc-700">·</span>
          <span><span className="font-semibold text-amber-400">{queued.length} queued</span></span>
          <span className="text-zinc-700">·</span>
          <span><span className="font-semibold text-emerald-400">{completed.length} completed today</span></span>
        </div>
        {(active.length > 0 || queued.length > 0) && (
          <button onClick={cancelAll} className="text-[10px] text-red-400/70 hover:text-red-400 transition-colors">
            Cancel All
          </button>
        )}
      </div>

      <div className="space-y-2">
        {jobs.map((job, i) => (
          <motion.div
            key={job.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'rounded-lg border p-3 transition-colors',
              job.status === 'active'    && 'border-blue-500/20 bg-blue-500/5',
              job.status === 'queued'    && 'border-amber-500/20 bg-amber-500/5',
              job.status === 'completed' && 'border-zinc-800 bg-zinc-900/40 opacity-70',
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers className={cn('h-3.5 w-3.5', STATUS_COLORS[job.status])} />
                <span className="text-[12px] font-medium text-zinc-200">{job.project}</span>
                <span className="text-[10px] text-zinc-500">{job.scenes}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {job.status === 'active' && (
                  <>
                    <span className="text-[10px] text-zinc-500">{job.eta}</span>
                    <button onClick={() => cancelJob(job.id)} aria-label="Cancel job" className="rounded p-0.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                    <button aria-label="Pause job" className="rounded p-0.5 text-zinc-600 hover:text-blue-400 hover:bg-blue-400/10 transition-colors">
                      <Pause className="h-3 w-3" />
                    </button>
                  </>
                )}
                {job.status === 'queued' && (
                  <>
                    <span className="text-[10px] text-amber-400 font-medium">Queued</span>
                    <button onClick={() => priorityUp(job.id)} aria-label="Increase priority" className="rounded p-0.5 text-zinc-600 hover:text-amber-400 hover:bg-amber-400/10 transition-colors" title="Move up in queue">
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button onClick={() => cancelJob(job.id)} aria-label="Cancel job" className="rounded p-0.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </>
                )}
                {job.status === 'completed' && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[10px] text-zinc-500">{job.completedAt}</span>
                  </div>
                )}
              </div>
            </div>

            {job.status === 'active' && job.progress !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-zinc-500">Progress</span>
                  <span className="text-[10px] font-medium text-blue-400">{job.progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${job.progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
              </div>
            )}

            {job.status === 'queued' && (
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="h-3 w-3 text-amber-400/60" />
                <span className="text-[10px] text-zinc-600">Waiting for an active slot...</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </ShowcaseSection>
  )
}
