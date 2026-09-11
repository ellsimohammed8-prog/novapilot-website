export default function PageIllustration({
  multiple = false,
}: {
  multiple?: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[840px] overflow-hidden"
      aria-hidden="true"
    >
      {/* Executive Cobalt Radial Ambient Wash (Subtle, Non-Blur, Architectural) */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[1100px] opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(29, 78, 216, 0.14) 0%, rgba(11, 15, 25, 0) 70%)",
        }}
      />

      {/* Bespoke Executive Hairline Grid & Vector Coordinate Structure */}
      <svg
        className="absolute left-1/2 top-0 -translate-x-1/2 w-[1440px] h-[720px] max-w-none text-white"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="executive-grid"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="1"
            />
            {/* Precision Crosshair at Intersection */}
            <path
              d="M 0 4 L 0 0 4 0"
              fill="none"
              stroke="rgba(29, 78, 216, 0.25)"
              strokeWidth="1"
            />
          </pattern>

          {/* Radial Fade Mask for Grid Structure */}
          <radialGradient
            id="grid-fade-mask"
            cx="50%"
            cy="15%"
            r="60%"
            fx="50%"
            fy="15%"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <mask id="grid-mask">
            <rect width="100%" height="100%" fill="url(#grid-fade-mask)" />
          </mask>
        </defs>

        {/* Masked Structural Grid */}
        <rect
          width="100%"
          height="100%"
          fill="url(#executive-grid)"
          mask="url(#grid-mask)"
        />

        {/* Structural Geometric Hairlines & Telemetry Guides */}
        <g stroke="rgba(29, 78, 216, 0.2)" strokeWidth="1" mask="url(#grid-mask)">
          {/* Central Symmetrical Guides */}
          <line x1="720" y1="0" x2="720" y2="480" strokeDasharray="4 8" />
          <line x1="320" y1="96" x2="1120" y2="96" strokeDasharray="2 12" />
          <line x1="448" y1="256" x2="992" y2="256" strokeDasharray="2 12" />

          {/* Precision Corner Reticles */}
          <path d="M 448 240 L 448 256 L 464 256" fill="none" stroke="rgba(0, 71, 171, 0.45)" />
          <path d="M 992 240 L 992 256 L 976 256" fill="none" stroke="rgba(0, 71, 171, 0.45)" />
          <path d="M 448 112 L 448 96 L 464 96" fill="none" stroke="rgba(0, 71, 171, 0.45)" />
          <path d="M 992 112 L 992 96 L 976 96" fill="none" stroke="rgba(0, 71, 171, 0.45)" />
        </g>
      </svg>

      {/* Multiple Layer Secondary Hairline Coordinates */}
      {multiple && (
        <div
          className="absolute left-1/2 top-[380px] -translate-x-1/2 w-[1200px] h-[360px] opacity-30 pointer-events-none"
          aria-hidden="true"
        >
          <svg
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="100"
              y1="40"
              x2="1100"
              y2="40"
              stroke="rgba(29, 78, 216, 0.2)"
              strokeWidth="1"
              strokeDasharray="4 16"
            />
            <circle cx="200" cy="40" r="3" fill="rgba(0, 71, 171, 0.5)" />
            <circle cx="1000" cy="40" r="3" fill="rgba(0, 71, 171, 0.5)" />
          </svg>
        </div>
      )}
    </div>
  );
}
