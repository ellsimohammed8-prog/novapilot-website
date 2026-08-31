import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  color?: string;
  accentColor?: string;
  showText?: boolean;
  textClassName?: string;
}

/**
 * NovaPilot logomark  -  Minimalist Pilot Chevron & Nova Star.
 * Royal Nova Design System: Ultra-high contrast, pristine visibility on pure dark backgrounds.
 */
export const NovaPilotLogoMark: React.FC<{
  size?: number;
  className?: string;
  color?: string;
  accentColor?: string;
}> = ({
  size = 28,
  className = "",
  color = "#0052FF",
  accentColor = "#FFFFFF",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 1024 1024"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Geometric N Silhouette */}
    <path
      d="M 80 944 L 80 200 L 200 80 L 330 80 L 694 580 L 694 80 L 944 80 L 944 824 L 824 944 L 694 944 L 330 444 L 330 944 Z"
      fill={color}
    />
    {/* Precision Pilot Chevron Cut */}
    <polygon
      points="472,450 552,512 472,574 512,574 592,512 512,450"
      fill={accentColor}
    />
  </svg>
);

export const NovaPilotLogo: React.FC<LogoProps> = ({
  size = 28,
  className = "",
  color = "#0052FF",
  accentColor = "#FFFFFF",
  showText = true,
  textClassName = "",
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-[#0052FF]/20 border border-[#0052FF]/40 shadow-[0_0_15px_rgba(0,82,255,0.4)] transition-transform hover:scale-105 duration-200">
        <NovaPilotLogoMark
          size={size}
          color={color}
          accentColor={accentColor}
        />
      </div>
      {showText && (
        <div className={`flex items-baseline gap-1.5 font-bold tracking-tight text-white text-xl drop-shadow-sm ${textClassName}`}>
          <span className="text-white">NovaPilot</span>
          <span className="text-[#0052FF] font-extrabold text-lg">AI</span>
        </div>
      )}
    </div>
  );
};
