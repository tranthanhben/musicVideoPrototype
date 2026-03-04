'use client'

import { Children } from 'react'
import type { ReactNode } from 'react'

interface FocusContainerProps {
  children: ReactNode
  focusedIndex: number | null
  onFocusChange: (index: number | null) => void
}

export function FocusContainer({ children, focusedIndex, onFocusChange }: FocusContainerProps) {
  const childArray = Children.toArray(children)

  return (
    <div className="flex flex-col">
      {childArray.map((child, index) => {
        const isDimmed = focusedIndex !== null && focusedIndex !== index
        return (
          <div
            key={index}
            className="transition-opacity duration-200 ease-out"
            style={{ opacity: isDimmed ? 0.4 : 1 }}
            onClick={() => onFocusChange(index)}
          >
            {child}
          </div>
        )
      })}
    </div>
  )
}
