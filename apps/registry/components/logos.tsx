export function ReactLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-11.5 -10.23 23 20.46"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="0" cy="0" r="2.05" fill="#61dafb" />
      <g stroke="#61dafb" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  );
}

export function VueLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 221" className={className} aria-hidden="true">
      <path
        d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 157.44 0h47.36Z"
        fill="#41b883"
      />
      <path
        d="M0 0l128 220.8L256 0h-51.2L128 132.48 50.56 0H0Z"
        fill="#41b883"
      />
      <path
        d="M50.56 0L128 133.12 204.8 0h-47.36L128 51.2 97.92 0H50.56Z"
        fill="#35495e"
      />
    </svg>
  );
}
