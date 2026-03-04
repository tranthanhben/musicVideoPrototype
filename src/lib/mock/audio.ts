import type { MockAudio } from './types'

function generateBeatMarkers(bpm: number, durationSeconds: number): number[] {
  const beatInterval = 60 / bpm
  const markers: number[] = []
  let current = 0
  while (current <= durationSeconds) {
    markers.push(parseFloat(current.toFixed(3)))
    current += beatInterval
  }
  return markers
}

export const cosmicLoveAudio: MockAudio = {
  title: 'Cosmic Love Story',
  artist: 'Aurora Synthwave',
  duration: 192, // 3:12
  bpm: 128,
  beatMarkers: generateBeatMarkers(128, 192),
}

export const neonCityAudio: MockAudio = {
  title: 'Neon City Nights',
  artist: 'Volt Collective',
  duration: 168, // 2:48
  bpm: 140,
  beatMarkers: generateBeatMarkers(140, 168),
}

export const oceanDreamsAudio: MockAudio = {
  title: 'Ocean Dreams',
  artist: 'Tide & Wave',
  duration: 240, // 4:00
  bpm: 96,
  beatMarkers: generateBeatMarkers(96, 240),
}
