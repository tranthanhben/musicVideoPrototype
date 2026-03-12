// Mock scene descriptions per storyline — keyed by storyline id
export const SCENE_DESCRIPTIONS: Record<string, string[]> = {
  'celestial-journey': [
    'Wide anamorphic: Aria floats alone in a violet nebula, crystal debris catching starlight. Cyan pulse glows from her chest.',
    'Low angle crane: Aria reaches through an asteroid field toward a pulsing star, silver dress flowing like mercury.',
    'Cockpit POV: Kael pilots his crystal ship into a spiraling wormhole, face lit by neon reflections.',
    'Aerial orbit: Aria and Kael dance on a silver moon with twin suns setting — a shared dream, fingers passing through like holograms.',
    'Extreme close-up: Aria sings before an exploding supernova, silver hair whipping in stellar shockwaves. Raw emotion.',
    'Medium rotation: Aria and Kael reunite in freefall through Saturn\'s golden ring particles. Hands touch — light shockwave ripples outward.',
    'Dynamic tracking: Kael plays electric guitar on a blazing comet, tail streaming behind him in brilliant blues. Pure euphoria.',
    'Slow pullback: Aria and Kael embrace at the edge of the universe. Their glow becomes a new star as camera reveals infinity.',
  ],
  'urban-pulse': [
    'Establishing: Rain hammers a neon-lit alley, reflections bleeding magenta and cyan across wet asphalt.',
    'Tracking: A dancer weaves through a midnight street market, smoke and lanterns overhead.',
    'Silhouette: Rooftop figure against the entire city light-grid, arms wide, wind pulling at loose fabric.',
    'Low angle: Underground club — strobes fire in sync with the bassline, bodies move as one organism.',
    'Time-lapse montage: Traffic veins pulse, signs flicker, the city breathes in fast-forward.',
    'Freeze frame: The dancer mid-leap against a wall of neon — the city exhales, and everything goes still.',
  ],
  'ocean-memory': [
    'Dawn: Misty shoreline, a woman\'s footprints dissolve with each wave, golden light on wet sand.',
    'Flashback: Children chase waves in warm summer haze, laughter distorted like an old recording.',
    'Medium: A woman holds a faded photograph by the tide — the image blurs when spray touches it.',
    'Underwater: Bioluminescent plankton drifts in slow motion, casting blue-green light on her face.',
    'Sunset: Golden light shatters across cresting waves, silhouetting a figure standing knee-deep.',
    'Night: Full moon carves a silver path on the open water — she follows it.',
    'Close-up: Hands release a paper boat into the surf. The current pulls it toward the horizon.',
    'Aerial: The coastline curves away into darkness, a single light visible on a distant cliff.',
    'Flashback: Two figures dance on wet sand, their shadows long in the amber light.',
    'Final: Waves wash over the last footprints. The photograph floats face-down in the shallows. Fade.',
  ],
}

export function interpolateHex(hex1: string, hex2: string, t: number): string {
  const r1 = parseInt(hex1.slice(1, 3), 16)
  const g1 = parseInt(hex1.slice(3, 5), 16)
  const b1 = parseInt(hex1.slice(5, 7), 16)
  const r2 = parseInt(hex2.slice(1, 3), 16)
  const g2 = parseInt(hex2.slice(3, 5), 16)
  const b2 = parseInt(hex2.slice(5, 7), 16)
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`
}
