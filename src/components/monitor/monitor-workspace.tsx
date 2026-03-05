'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { JourneyStateId } from '@/lib/journey/orchestrator'

// Views
import { UploadView } from './workspace-views/upload-view'
import { InputView } from './workspace-views/input-view'
import { StyleSelectionView, type StyleSelections } from './workspace-views/style-selection-view'
import { CharacterSetupView } from './workspace-views/character-setup-view'
import { CreativeView } from './workspace-views/creative-view'
import { StoryboardView } from './workspace-views/storyboard-view'
import { GenerationView } from './workspace-views/generation-view'
import { EditingView } from './workspace-views/editing-view'
import { GenerationLoading } from '@/components/shared/generation-loading'

interface MonitorWorkspaceProps {
  viewHint: string
  journeyState: JourneyStateId
  projectIndex: number
  onTrackSelect: (index: number) => void
  onStyleConfirm: (selections: StyleSelections) => void
  onCharacterConfirm: (ids: string[]) => void
}

const VIEW_LABELS: Record<string, string> = {
  upload: 'Upload Track',
  analyzing: 'Analyzing...',
  analysis: 'Music Analysis',
  style: 'Creative Direction',
  characters: 'Character Setup',
  storyline_loading: 'Generating Storylines...',
  storyline: 'Storyline Options',
  storyboard_loading: 'Building Storyboard...',
  storyboard: 'Storyboard',
  generate: 'Video Generation',
  edit_loading: 'Assembling...',
  edit: 'Post-Production',
}

const variants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export function MonitorWorkspace({
  viewHint, journeyState, projectIndex,
  onTrackSelect, onStyleConfirm, onCharacterConfirm,
}: MonitorWorkspaceProps) {
  const label = VIEW_LABELS[viewHint] ?? ''

  function renderView() {
    switch (viewHint) {
      case 'upload':
        return <UploadView onTrackSelect={onTrackSelect} />

      case 'analyzing':
        return (
          <div className="flex h-full items-center justify-center">
            <GenerationLoading progress={0} message="Analyzing track..." variant="default" />
          </div>
        )

      case 'analysis':
        return <InputView projectIndex={projectIndex} />

      case 'style':
        return <StyleSelectionView onConfirm={onStyleConfirm} />

      case 'characters':
        return <CharacterSetupView onConfirm={onCharacterConfirm} />

      case 'storyline_loading':
        return (
          <div className="flex h-full items-center justify-center">
            <GenerationLoading progress={0} message="Generating storylines..." variant="default" />
          </div>
        )

      case 'storyline':
        return <CreativeView />

      case 'storyboard_loading':
        return (
          <div className="flex h-full items-center justify-center">
            <GenerationLoading progress={0} message="Building storyboard..." variant="default" />
          </div>
        )

      case 'storyboard':
        return <StoryboardView />

      case 'generate':
        return <GenerationView />

      case 'edit_loading':
        return (
          <div className="flex h-full items-center justify-center">
            <GenerationLoading progress={0} message="Assembling final cut..." variant="default" />
          </div>
        )

      case 'edit':
        return <EditingView />

      default:
        return (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                <span className="text-2xl">🎬</span>
              </div>
              <p className="text-sm font-medium text-foreground">Getting ready...</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-muted/20">
      {/* View label badge */}
      {label && (
        <div className="absolute top-4 right-4 z-10">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
            {label}
          </span>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={viewHint}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex h-full w-full flex-col"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
