"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { FrameworkSwitch } from "@/components/framework-context";
import { ToastLayoutToggle } from "@/components/toast-layout-toggle";

export function VariantNav({
  items,
}: {
  items: { key: string; title: string }[];
}) {
  const [active, setActive] = useState(items[0]?.key);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // Trigger when a card enters the upper part of the viewport.
      { rootMargin: "-15% 0px -75% 0px", threshold: 0 },
    );
    for (const it of items) {
      const el = document.getElementById(it.key);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="lg:sticky lg:top-6">
      <div className="mb-4">
        <p className="text-muted-foreground mb-2 px-3 text-xs font-semibold uppercase tracking-wide">
          Framework
        </p>
        <div className="px-3">
          <FrameworkSwitch />
        </div>
      </div>
      <div className="mb-4">
        <p className="text-muted-foreground mb-2 px-3 text-xs font-semibold uppercase tracking-wide">
          Toast layout
        </p>
        <div className="px-3">
          <ToastLayoutToggle />
        </div>
      </div>
      <p className="text-muted-foreground mb-2 flex items-center gap-1.5 px-3 text-xs font-semibold uppercase tracking-wide">
        On this page
        <span
          aria-hidden
          className="bg-linear-to-br from-sapa-warning to-sapa-error size-1.5 rounded-full"
        />
      </p>
      <ul className="flex flex-row flex-wrap gap-1 lg:flex-col">
        {items.map((it) => (
          <li key={it.key}>
            <a
              href={`#${it.key}`}
              className={cn(
                "relative block rounded-md px-3 py-1.5 text-sm transition-colors",
                active === it.key
                  ? "bg-linear-to-r from-sapa-warning/15 to-sapa-error/10 text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {active === it.key && (
                <span
                  aria-hidden
                  className="bg-linear-to-b from-sapa-warning to-sapa-error absolute inset-y-1 left-0 hidden w-0.5 rounded-full lg:block"
                />
              )}
              {it.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
