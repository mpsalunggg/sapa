export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
      {children}
    </code>
  );
}
