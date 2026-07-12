import { Check, CircleAlert, Info, TriangleAlert, X } from "lucide-react";

const TOASTS = [
  {
    Icon: Check,
    label: "Operation successful!",
    chip: "bg-sapa-success",
    text: "text-sapa-success",
    ring: "border-sapa-success/50 shadow-sapa-success/10",
  },
  {
    Icon: Info,
    label: "Execute the operation",
    chip: "bg-sapa-info",
    text: "text-sapa-info",
    ring: "border-sapa-info/50 shadow-sapa-info/10",
  },
  {
    Icon: TriangleAlert,
    label: "Operation in progress",
    chip: "bg-sapa-warning",
    text: "text-sapa-warning",
    ring: "border-sapa-warning/50 shadow-sapa-warning/10",
  },
  {
    Icon: CircleAlert,
    label: "Operation unsuccessful",
    chip: "bg-sapa-error",
    text: "text-sapa-error",
    ring: "border-sapa-error/50 shadow-sapa-error/10",
  },
] as const;

export function HeroToastPreview() {
  return (
    <div className="ml-auto w-full max-w-xs space-y-2.5">
      {TOASTS.map(({ Icon, label, chip, text, ring }, i) => (
        <div
          key={label}
          style={{ animationDelay: `${i * 90}ms` }}
          className={`flex items-center gap-2.5 rounded-full border bg-popover/95 p-2 pr-3.5 shadow-lg shadow-black/5 backdrop-blur duration-500 animate-in fade-in slide-in-from-bottom-3 fill-mode-both ${ring}`}
        >
          <span
            className={`flex size-7 shrink-0 items-center justify-center rounded-full text-white ${chip}`}
          >
            <Icon className="size-4" strokeWidth={2.5} />
          </span>
          <span className={`truncate text-[13px] font-semibold ${text}`}>
            {label}
          </span>
          <X className="ml-auto size-3.5 shrink-0 text-muted-foreground/60" />
        </div>
      ))}
    </div>
  );
}
