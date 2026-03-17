'use client'

import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface InfoTooltipProps {
  content: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function InfoTooltip({ content, side = 'top' }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center cursor-help ml-1">
            <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-[200px] text-[11px]">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
