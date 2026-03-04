'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

export function FloatingCreateButton() {
  const router = useRouter()

  return (
    <motion.button
      onClick={() => router.push('/vibe/create')}
      className="fixed bottom-24 right-4 z-50 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg"
      style={{
        background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
        boxShadow: '0 8px 24px rgba(236, 72, 153, 0.4)',
      }}
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      aria-label="Create new video"
    >
      <Plus className="h-7 w-7" strokeWidth={2.5} />
    </motion.button>
  )
}
