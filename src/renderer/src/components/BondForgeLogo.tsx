import React from 'react'

interface LogoProps {
  className?: string
  size?: number
}

/**
 * Bespoke BondForge Nexus Logo
 * Represents 3 independent network conduits (Wi-Fi, Cellular, Ethernet)
 * converging into a unified, high-velocity forged data beam.
 */
export function BondForgeLogo({ className = '', size = 28 }: LogoProps): React.JSX.Element {
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
        {/* Core Nexus Gradient */}
        <linearGradient
          id="bfCoreGrad"
          x1="4"
          y1="4"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        {/* Ambient Glow */}
        <filter id="bfGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0284c7" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Background Squircle Shield */}
      <rect
        x="2"
        y="2"
        width="32"
        height="32"
        rx="8"
        fill="#0b1324"
        stroke="rgba(56, 189, 248, 0.3)"
        strokeWidth="1.2"
      />

      {/* Conduit 1 (Top Path - Wi-Fi Stream) */}
      <path
        d="M 8 11 C 14 11 17 15 22 17"
        stroke="#38bdf8"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Conduit 2 (Center Path - High-Speed Core) */}
      <path d="M 6 18 H 25" stroke="url(#bfCoreGrad)" strokeWidth="2.8" strokeLinecap="round" />

      {/* Conduit 3 (Bottom Path - Cellular / Tether Stream) */}
      <path
        d="M 8 25 C 14 25 17 21 22 19"
        stroke="#818cf8"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Forged Focal Nexus Point (Accelerated Forward Chevron) */}
      <path
        d="M 23 13 L 29 18 L 23 23"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#bfGlow)"
      />

      {/* Central Spark Node */}
      <circle cx="21" cy="18" r="1.6" fill="#38bdf8" />
    </svg>
  )
}
