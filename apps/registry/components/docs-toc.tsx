"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { FrameworkSwitch } from "@/components/framework-context";

export interface TocItem {
  key: string;
  title: string;
}

export interface TocGroup {
  label: string;
  items: TocItem[];
}

export function DocsToc({ groups }: { groups: TocGroup[] }) {
  const allItems = groups.flatMap((g) => g.items);
  const [active, setActive] = useState(allItems[0]?.key);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // Trigger when a section enters the upper part of the viewport.
      { rootMargin: "-15% 0px -75% 0px", threshold: 0 },
    );
    for (const it of allItems) {
      const el = document.getElementById(it.key);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  return (
    <nav className="lg:sticky lg:top-6">
      <div className="mb-5">
        <p className="font-display text-muted-foreground mb-2 px-3 text-[0.95rem] italic">
          Framework
        </p>
        <div className="px-3">
          <FrameworkSwitch />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="font-display text-muted-foreground mb-2 flex items-center gap-1.5 px-3 text-[0.95rem] italic">
              {group.label}
              <span
                aria-hidden
                className="bg-linear-to-br from-sapa-warning to-sapa-error size-1.5 rounded-full"
              />
            </p>
            <ul className="flex flex-row flex-wrap gap-1 lg:flex-col">
              {group.items.map((it) => (
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
          </div>
        ))}
      </div>
    </nav>
  );
}
