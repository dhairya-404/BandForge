import React from 'react'

interface LogoProps {
  className?: string
  size?: number
}

/**
 * Bespoke Tesso Logo Mark
 * Represents woven parallel network conduits (from Latin 'tessere' - to weave)
 * interlinking into a dynamic high-velocity 'T' ligature.
 */
export function TessoLogo({ className = '', size = 28 }: LogoProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        {/* Core Tesso Gradient */}
        <linearGradient id="tessoGrad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        {/* Ambient Glow */}
        <filter id="tessoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0ea5e9" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Background Squircle Shield */}
      <rect
        x="2.5"
        y="2.5"
        width="31"
        height="31"
        rx="8"
        fill="#0b1324"
        stroke="rgba(56, 189, 248, 0.28)"
        strokeWidth="1.2"
      />

      {/* Horizontal Crossbar (Woven streams flowing in parallel) */}
      <path d="M 8 11.5 H 28" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M 10 15.5 H 26"
        stroke="rgba(56, 189, 248, 0.45)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Vertical High-Speed Aggregator Trunk */}
      <path
        d="M 18 11.5 V 27"
        stroke="url(#tessoGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
        filter="url(#tessoGlow)"
      />

      {/* Interlaced Diagonal Weave Ribbons (Left & Right convergence) */}
      <path
        d="M 11 25 L 18 20 L 25 25"
        stroke="#818cf8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Central Pulse Node */}
      <circle cx="18" cy="18" r="1.8" fill="#ffffff" />
    </svg>
  )
}

// Backward-compatible alias
export const BondForgeLogo = TessoLogo
