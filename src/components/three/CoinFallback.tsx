/**
 * Static stand-in for the WebGL coin scene — used while the 3D chunk loads and
 * as the permanent fallback on devices without WebGL, so the hero never has a
 * blank column.
 */
export default function CoinFallback({ pulsing = false }: { pulsing?: boolean }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center ${
        pulsing ? "animate-pulse" : ""
      }`}
      aria-hidden={pulsing || undefined}
      role={pulsing ? undefined : "img"}
      aria-label={pulsing ? undefined : "Gold trading coins"}
    >
      <svg viewBox="0 0 400 400" className="h-full w-full max-w-full">
        <defs>
          <radialGradient id="coinFace" cx="35%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#f7e6b0" />
            <stop offset="45%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#9d7c22" />
          </radialGradient>
          <radialGradient id="coinFaceSm" cx="35%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#f0d484" />
            <stop offset="50%" stopColor="#c9a431" />
            <stop offset="100%" stopColor="#8d6f1e" />
          </radialGradient>
        </defs>

        <ellipse cx="200" cy="330" rx="120" ry="20" fill="#18181b" opacity="0.14" />

        {/* back-left */}
        <g transform="translate(96 232) rotate(-14)">
          <circle r="56" fill="url(#coinFaceSm)" />
          <circle r="41" fill="none" stroke="#f0d484" strokeWidth="5" opacity="0.55" />
          <circle r="17" fill="none" stroke="#f7e6b0" strokeWidth="6" opacity="0.5" />
        </g>

        {/* back-right */}
        <g transform="translate(305 246) rotate(12)">
          <circle r="43" fill="url(#coinFaceSm)" />
          <circle r="31" fill="none" stroke="#f0d484" strokeWidth="4" opacity="0.55" />
          <circle r="13" fill="none" stroke="#f7e6b0" strokeWidth="5" opacity="0.5" />
        </g>

        {/* hero coin */}
        <g transform="translate(200 176)">
          <circle r="104" fill="url(#coinFace)" />
          <circle r="77" fill="none" stroke="#f0d484" strokeWidth="9" opacity="0.6" />
          <circle r="31" fill="none" stroke="#f7e6b0" strokeWidth="11" opacity="0.55" />
        </g>
      </svg>
    </div>
  );
}
