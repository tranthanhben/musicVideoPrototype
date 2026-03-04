'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChromeText } from '@/components/neon/chrome-text'
import { NeonPanel } from '@/components/neon/neon-panel'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'
import { mockProjects } from '@/lib/mock/projects'

const project = mockProjects[1] // Neon City Nights

const PLATFORMS = [
  { id: 'tiktok', label: 'TikTok', ratio: '9:16' as const, desc: '9:16 vertical' },
  { id: 'instagram', label: 'Instagram', ratio: '1:1' as const, desc: '1:1 square' },
  { id: 'youtube', label: 'YouTube', ratio: '16:9' as const, desc: '16:9 landscape' },
]

function ParticleBurst() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    angle: (360 / 20) * i,
    color: i % 3 === 0 ? '#FF006E' : i % 3 === 1 ? '#00F5D4' : '#FEE440',
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-full"
          style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * 240,
            y: Math.sin((p.angle * Math.PI) / 180) * 240,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      ))}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 0,
          height: 0,
          background: 'radial-gradient(circle, rgba(255,0,110,0.4) 0%, rgba(0,245,212,0.2) 50%, transparent 70%)',
        }}
        animate={{ width: 600, height: 600, opacity: [1, 0] }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
    </div>
  )
}

export default function ShowcasePage() {
  const router = useRouter()
  const [published, setPublished] = useState(false)
  const [showBurst, setShowBurst] = useState(false)

  function handlePublish() {
    setShowBurst(true)
    setPublished(true)
    setTimeout(() => setShowBurst(false), 1500)
  }

  return (
    <div className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <AnimatePresence>{showBurst && <ParticleBurst />}</AnimatePresence>

      {/* Nav */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={() => router.push('/neon/workspace?id=project-neon')}
          className="text-[#888899] text-sm hover:text-[#00F5D4] transition-colors"
        >
          ← Back to Workspace
        </button>
        <button
          onClick={() => router.push('/neon')}
          className="text-[#888899] text-sm hover:text-[#FF006E] transition-colors"
        >
          Launchpad
        </button>
      </div>

      {/* Heading */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ChromeText as="h1" className="text-5xl mb-2">Ready to Share</ChromeText>
        <p className="text-[#888899] text-sm">{project.title} · {project.scenes.length} scenes</p>
      </motion.div>

      {/* Main preview */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <NeonPanel glowColor="pink" title="Final Preview">
          <div className="p-4">
            <MockVideoPlayer
              thumbnailUrl={project.thumbnailUrl}
              duration={project.audio.duration}
              aspectRatio="16:9"
            />
          </div>
        </NeonPanel>
      </motion.div>

      {/* Platform previews */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {PLATFORMS.map((platform, idx) => {
          const glows = ['cyan', 'pink', 'yellow'] as const
          return (
            <NeonPanel key={platform.id} glowColor={glows[idx]} title={platform.label}>
              <div className="p-4">
                <MockVideoPlayer
                  thumbnailUrl={project.scenes[idx % project.scenes.length].thumbnailUrl}
                  duration={project.scenes[idx % project.scenes.length].duration}
                  aspectRatio={platform.ratio}
                />
                <p className="mt-2 text-center text-[10px] text-[#888899] uppercase tracking-widest">
                  {platform.desc}
                </p>
              </div>
            </NeonPanel>
          )
        })}
      </motion.div>

      {/* Publish button */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {published ? (
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <p
              className="text-lg font-semibold mb-1"
              style={{
                background: 'linear-gradient(135deg, #FF006E, #00F5D4)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'var(--font-space-grotesk, sans-serif)',
              }}
            >
              Published!
            </p>
            <p className="text-[#888899] text-sm">Your video is now live across all platforms.</p>
          </motion.div>
        ) : (
          <motion.button
            onClick={handlePublish}
            className="px-12 py-4 rounded-full text-lg font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #FF006E, #00F5D4)',
              boxShadow: '0 0 30px rgba(255,0,110,0.4), 0 0 60px rgba(0,245,212,0.2)',
              fontFamily: 'var(--font-space-grotesk, sans-serif)',
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 50px rgba(255,0,110,0.6), 0 0 100px rgba(0,245,212,0.3)',
            }}
            whileTap={{ scale: 0.97 }}
          >
            Publish Now
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}
