import React from "react";

export function BatikMotif({ className = "w-80 h-80 text-white" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Center core */}
      <circle cx="150" cy="150" r="13" fill="currentColor" />
      <circle cx="150" cy="150" r="6" fill="white" fillOpacity="0.35" />
      {/* Cecek dots around center */}
      <g fill="currentColor" opacity="0.9">
        <circle cx="150" cy="118" r="2.2" />
        <circle cx="172" cy="128" r="2.2" />
        <circle cx="182" cy="150" r="2.2" />
        <circle cx="172" cy="172" r="2.2" />
        <circle cx="150" cy="182" r="2.2" />
        <circle cx="128" cy="172" r="2.2" />
        <circle cx="118" cy="150" r="2.2" />
        <circle cx="128" cy="128" r="2.2" />
      </g>

      {/* 8 main petals - Kawung / Truntum style */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <g key={angle} transform={`rotate(${angle} 150 150)`}>
          {/* outer petal */}
          <ellipse cx="150" cy="78" rx="22" ry="38" fill="currentColor" />
          {/* inner detail - isen cecek */}
          <ellipse cx="150" cy="78" rx="11" ry="20" fill="none" stroke="white" strokeOpacity="0.28" strokeWidth="1.6" />
          <ellipse cx="150" cy="78" rx="5.5" ry="10" fill="white" fillOpacity="0.18" />
          {/* small dots inside petal */}
          <circle cx="150" cy="68" r="1.7" fill="white" fillOpacity="0.85" />
          <circle cx="150" cy="88" r="1.7" fill="white" fillOpacity="0.85" />
          {/* tip ornament */}
          <circle cx="150" cy="48" r="3.2" fill="currentColor" />
          <circle cx="150" cy="48" r="1.2" fill="white" fillOpacity="0.9" />
        </g>
      ))}

      {/* 4 larger Kawung leaves at cardinal directions (outer layer) */}
      {[0, 90, 180, 270].map((angle) => (
        <g key={`outer-${angle}`} transform={`rotate(${angle} 150 150)`} opacity="0.55">
          <path
            d="M150 18 C 168 32, 172 58, 150 78 C 128 58, 132 32, 150 18 Z"
            fill="currentColor"
          />
          <path
            d="M150 28 C 160 36, 162 52, 150 66 C 138 52, 140 36, 150 28 Z"
            fill="none"
            stroke="white"
            strokeOpacity="0.22"
            strokeWidth="1.2"
          />
        </g>
      ))}

      {/* Outer cecek ring */}
      <g fill="currentColor" opacity="0.5">
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * 15 * Math.PI) / 180;
          const r = 132;
          const x = 150 + Math.cos(a) * r;
          const y = 150 + Math.sin(a) * r;
          return <circle key={i} cx={x} cy={y} r={i % 2 === 0 ? 2 : 1.3} />;
        })}
      </g>

      {/* Parang / Mega Mendung subtle waves at corners */}
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.18" fill="none">
        <path d="M 30 70 Q 55 55, 80 70 T 130 70" />
        <path d="M 170 230 Q 195 215, 220 230 T 270 230" />
        <path d="M 70 270 Q 55 245, 70 220 T 70 170" />
        <path d="M 230 30 Q 245 55, 230 80 T 230 130" />
      </g>
    </svg>
  );
}

export function BatikPatternBg({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none opacity-[0.07] ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='white' fill-opacity='1'><circle cx='60' cy='60' r='3'/><circle cx='30' cy='30' r='1.5'/><circle cx='90' cy='30' r='1.5'/><circle cx='30' cy='90' r='1.5'/><circle cx='90' cy='90' r='1.5'/><path d='M60 18 C68 26 68 38 60 46 C52 38 52 26 60 18 Z' /><path d='M60 74 C68 82 68 94 60 102 C52 94 52 82 60 74 Z' /><path d='M18 60 C26 52 38 52 46 60 C38 68 26 68 18 60 Z' /><path d='M74 60 C82 52 94 52 102 60 C94 68 82 68 74 60 Z' /></g></svg>`
        )}")`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}
