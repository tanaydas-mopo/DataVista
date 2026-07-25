interface DataVistaLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  animate?: boolean;
  className?: string;
}

export function DataVistaLogo({
  size = "md",
  showText = true,
  animate = true,
  className = "",
}: DataVistaLogoProps) {
  // Dimension map
  const sizeMap = {
    sm: { icon: 28, font: "text-lg", gap: "gap-2" },
    md: { icon: 36, font: "text-xl", gap: "gap-2.5" },
    lg: { icon: 48, font: "text-2xl", gap: "gap-3" },
    xl: { icon: 64, font: "text-4xl", gap: "gap-4" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
      {/* Dynamic DV Data Peak Animated SVG Icon */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-[0_4px_12px_rgba(59,130,246,0.35)]"
      >
        <defs>
          {/* Main DV Gradient */}
          <linearGradient id="dvBlueCyanGrad" x1="10" y1="90" x2="80" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          {/* Bar 1 Gradient */}
          <linearGradient id="barGrad1" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Bar 2 Gradient */}
          <linearGradient id="barGrad2" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>

          {/* Bar 3 Gradient */}
          <linearGradient id="barGrad3" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
        </defs>

        <style>{`
          @keyframes dvPopIn {
            0% { transform: scale(0.85); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes barRise1 {
            0% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
            100% { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
          }
          .animate-dv-mark {
            ${animate ? "animation: dvPopIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;" : ""}
          }
          .animate-bar-1 {
            ${animate ? "animation: barRise1 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards; transform-origin: 52px 50px;" : ""}
          }
          .animate-bar-2 {
            ${animate ? "animation: barRise1 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; transform-origin: 67px 50px;" : ""}
          }
          .animate-bar-3 {
            ${animate ? "animation: barRise1 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.45s forwards; transform-origin: 82px 50px;" : ""}
          }
        `}</style>

        <g className="animate-dv-mark">
          {/* Letter D */}
          <path
            d="M 12 40 C 12 36, 16 36, 22 36 L 36 36 C 50 36, 58 44, 58 56 C 58 68, 50 76, 36 76 L 22 76 C 16 76, 12 76, 12 72 Z M 26 48 L 26 64 L 35 64 C 42 64, 46 61, 46 56 C 46 51, 42 48, 35 48 Z"
            fill="url(#dvBlueCyanGrad)"
          />

          {/* Letter V */}
          <path
            d="M 52 76 L 66 40 L 78 40 L 68 74 C 66 79, 62 82, 58 82 C 54 82, 50 79, 48 74 L 42 58 L 51 58 Z"
            fill="url(#dvBlueCyanGrad)"
          />

          {/* Rising Bar Chart Peak 1 (Short - Cyan) */}
          <rect
            x="49"
            y="32"
            width="10"
            height="20"
            rx="3"
            fill="url(#barGrad1)"
            className="animate-bar-1"
          />

          {/* Rising Bar Chart Peak 2 (Medium - Blue) */}
          <rect
            x="63"
            y="20"
            width="10"
            height="32"
            rx="3"
            fill="url(#barGrad2)"
            className="animate-bar-2"
          />

          {/* Rising Bar Chart Peak 3 (Tall - Violet) */}
          <rect
            x="77"
            y="8"
            width="10"
            height="44"
            rx="3"
            fill="url(#barGrad3)"
            className="animate-bar-3"
          />
        </g>
      </svg>

      {/* Brand Text */}
      {showText && (
        <span
          className={`font-extrabold tracking-tight text-textPrimary ${currentSize.font} ${
            animate ? "animate-in fade-in duration-500" : ""
          }`}
        >
          Data<span className="text-primary">Vista</span>
        </span>
      )}
    </div>
  );
}
