import { cn } from "@/lib/utils"

export function GradientLoader({
  label = "Loading playground…",
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className
      )}
    >
      <div className="relative size-12 overflow-hidden bg-gray-100 rounded-full ring-1 ring-inset ring-white/10">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="loader-wave-back" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--sapa-info)" />
              <stop offset="100%" stopColor="var(--sapa-warning)" />
            </linearGradient>
            <linearGradient id="loader-wave-front" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--sapa-warning)" />
              <stop offset="100%" stopColor="var(--sapa-error)" />
            </linearGradient>
          </defs>

          {/* wave belakang, lebih lambat */}
          <g className="animate-loader-wave" style={{ animationDuration: "3.2s" }}>
            <path
              d="M0,58 C25,48 25,68 50,58 C75,48 75,68 100,58 C125,48 125,68 150,58 C175,48 175,68 200,58 L200,100 L0,100 Z"
              fill="url(#loader-wave-back)"
              opacity="0.55"
            />
          </g>

          {/* wave depan, lebih cepat & fase berbeda */}
          <g className="animate-loader-wave" style={{ animationDuration: "1.8s" }}>
            <path
              d="M0,66 C25,76 25,56 50,66 C75,76 75,56 100,66 C125,76 125,56 150,66 C175,76 175,56 200,66 L200,100 L0,100 Z"
              fill="url(#loader-wave-front)"
              opacity="0.85"
            />
          </g>
        </svg>

        {/* ring tipis biar batas lingkaran tetap kelihatan rapi */}
        <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" />
      </div>

      <span className="animate-pulse bg-linear-to-r from-sapa-warning to-sapa-error bg-clip-text text-sm font-medium text-transparent">
        {label}
      </span>

      <style>{`
        @keyframes loader-wave-x {
          from { transform: translateX(0); }
          to { transform: translateX(-100px); }
        }
        .animate-loader-wave {
          animation-name: loader-wave-x;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  )
}