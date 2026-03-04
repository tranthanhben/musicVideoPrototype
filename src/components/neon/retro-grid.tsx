export function RetroGrid() {
  return (
    <>
      <style>{`
        @keyframes grid-scroll {
          0% { transform: perspective(400px) rotateX(60deg) translateY(0); }
          100% { transform: perspective(400px) rotateX(60deg) translateY(80px); }
        }
        .retro-grid-lines {
          animation: grid-scroll 3s linear infinite;
        }
      `}</style>
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Perspective grid */}
        <div
          className="absolute inset-x-0 bottom-0 h-[70%]"
          style={{
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
          }}
        >
          <svg
            className="retro-grid-lines w-full h-[200%]"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="neon-grid"
                x="0"
                y="0"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 80 0 L 0 0 0 80"
                  fill="none"
                  stroke="rgba(255,0,110,0.08)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#neon-grid)" />
          </svg>
        </div>

        {/* Horizon glow line */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: '30%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,0,110,0.4), rgba(0,245,212,0.4), transparent)',
            boxShadow: '0 0 20px rgba(255,0,110,0.3), 0 0 40px rgba(0,245,212,0.2)',
          }}
        />

        {/* Top vignette */}
        <div
          className="absolute inset-x-0 top-0 h-1/3"
          style={{
            background: 'linear-gradient(to bottom, #0A0A0F 0%, transparent 100%)',
          }}
        />

        {/* Side fades */}
        <div
          className="absolute inset-y-0 left-0 w-1/4"
          style={{
            background: 'linear-gradient(to right, #0A0A0F 0%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-1/4"
          style={{
            background: 'linear-gradient(to left, #0A0A0F 0%, transparent 100%)',
          }}
        />
      </div>
    </>
  )
}
