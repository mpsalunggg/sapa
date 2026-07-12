export function HeroWaves() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          className="fill-sapa-warning/10"
          d="M0,0 H1440 V500 C1200,560 960,440 720,500 S240,560 0,500 Z"
        />
        <path
          className="fill-sapa-error/10"
          d="M0,0 H1440 V455 C1200,395 960,515 720,455 S240,395 0,455 Z"
        />
        <path
          className="fill-sapa-warning/10"
          d="M0,0 H1440 V415 C1200,470 960,360 720,415 S240,470 0,415 Z"
        />
      </svg>
    </div>
  )
}
