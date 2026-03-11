'use client'

import { useState, useEffect } from 'react'
import { mockProjects } from '@/lib/mock/projects'
import { AnalysisLoading } from './analysis-loading'
import { AnalysisResults } from './analysis-results'

interface AnalysisStepProps {
  trackIndex: number
  selectedConceptId: string | null
  onConceptSelect: (id: string) => void
  onAnalysisComplete: () => void
}

export function AnalysisStep({ trackIndex, selectedConceptId, onConceptSelect, onAnalysisComplete }: AnalysisStepProps) {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState<'analyzing' | 'complete'>('analyzing')

  const audio = mockProjects[trackIndex]?.audio ?? mockProjects[0].audio

  useEffect(() => {
    if (stage !== 'analyzing') return
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setStage('complete')
          return 100
        }
        return p + 4
      })
    }, 80)
    return () => clearInterval(interval)
  }, [stage])

  if (stage === 'analyzing') {
    return <AnalysisLoading progress={progress} />
  }

  return (
    <AnalysisResults
      audio={audio}
      selectedConceptId={selectedConceptId}
      onConceptSelect={onConceptSelect}
      onContinue={onAnalysisComplete}
    />
  )
}
