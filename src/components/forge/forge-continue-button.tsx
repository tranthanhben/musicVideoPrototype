'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Download, Loader2, Check, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ForgeContinueButtonProps {
  locked: boolean
  nextStepName: string
  onContinue: () => void
  isFinal: boolean
  onRevise?: () => void
  gateReady?: boolean
}

export function ForgeContinueButton({
  locked,
  nextStepName,
  onContinue,
  isFinal,
  onRevise,
  gateReady,
}: ForgeContinueButtonProps) {
  if (gateReady) {
    return (
      <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-border bg-background/80 backdrop-blur-sm">
        <motion.button
          onClick={onContinue}
          animate={{
            boxShadow: [
              '0 0 0px rgba(124,58,237,0)',
              '0 0 20px rgba(124,58,237,0.5)',
              '0 0 8px rgba(124,58,237,0.3)',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className={cn(
            'flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm transition-all duration-300 cursor-pointer shadow-lg',
            isFinal
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground',
          )}
        >
          <Check className="h-4 w-4" />
          <span>
            {isFinal ? 'Approve & Export' : `Approve & Continue to ${nextStepName}`}
          </span>
        </motion.button>

        {onRevise && (
          <button
            onClick={onRevise}
            className="flex items-center gap-2 px-5 py-3 rounded-full font-medium text-sm transition-all duration-300 cursor-pointer bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Request Revision</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center px-6 py-4 border-t border-border bg-background/80 backdrop-blur-sm">
      <motion.button
        onClick={!locked ? onContinue : undefined}
        disabled={locked}
        animate={
          !locked
            ? {
                boxShadow: [
                  '0 0 0px rgba(124,58,237,0)',
                  '0 0 20px rgba(124,58,237,0.5)',
                  '0 0 8px rgba(124,58,237,0.3)',
                ],
              }
            : {}
        }
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className={cn(
          'flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm transition-all duration-300',
          locked
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : isFinal
            ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg cursor-pointer',
        )}
      >
        {locked ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : isFinal ? (
          <>
            <Download className="h-4 w-4" />
            <span>Export Video</span>
          </>
        ) : (
          <>
            <span>Continue to {nextStepName}</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </motion.button>
    </div>
  )
}
