'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CanvasViewportProps {
  zoom: number
  panX: number
  panY: number
  onZoomChange: (zoom: number) => void
  onPanChange: (panX: number, panY: number) => void
  children: React.ReactNode
  className?: string
}

export function CanvasViewport({
  zoom, panX, panY, onZoomChange, onPanChange, children, className,
}: CanvasViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isPanningRef = useRef(false)
  const lastMouseRef = useRef({ x: 0, y: 0 })
  const [spaceHeld, setSpaceHeld] = useState(false)
  const spaceHeldRef = useRef(false)
  const panXRef = useRef(panX)
  const panYRef = useRef(panY)
  const zoomRef = useRef(zoom)

  // Keep refs in sync with props
  useEffect(() => { panXRef.current = panX }, [panX])
  useEffect(() => { panYRef.current = panY }, [panY])
  useEffect(() => { zoomRef.current = zoom }, [zoom])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const next = Math.min(2.0, Math.max(0.3, zoomRef.current + delta))
    onZoomChange(next)
  }, [onZoomChange])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle button (button=1) or space+left click
    if (e.button === 1 || (e.button === 0 && spaceHeldRef.current)) {
      e.preventDefault()
      isPanningRef.current = true
      lastMouseRef.current = { x: e.clientX, y: e.clientY }
    }
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanningRef.current) return
    const dx = e.clientX - lastMouseRef.current.x
    const dy = e.clientY - lastMouseRef.current.y
    lastMouseRef.current = { x: e.clientX, y: e.clientY }
    onPanChange(panXRef.current + dx / zoomRef.current, panYRef.current + dy / zoomRef.current)
  }, [onPanChange])

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false
  }, [])

  // Space key for pan mode
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space') { e.preventDefault(); spaceHeldRef.current = true; setSpaceHeld(true) }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space') { spaceHeldRef.current = false; setSpaceHeld(false) }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp) }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      el.removeEventListener('wheel', handleWheel)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleWheel, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden w-full h-full select-none', className)}
      onMouseDown={handleMouseDown}
      style={{
        cursor: spaceHeld ? 'grab' : 'default',
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)`,
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${panX * zoom}px ${panY * zoom}px`,
      }}
    >
      {/* Transformed canvas */}
      <div
        style={{
          transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {children}
      </div>
    </div>
  )
}
