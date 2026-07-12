"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

export function VariantNav({
  items,
}: {
  items: { key: string; title: string }[]
}) {
  const [active, setActive] = useState(items[0]?.key)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      // Trigger when a card enters the upper part of the viewport.
      { rootMargin: "-15% 0px -75% 0px", threshold: 0 }
    )
    for (const it of items) {
      const el = document.getElementById(it.key)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [items])

  return (
    <nav className="lg:sticky lg:top-6">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        On this page
      </p>
      <ul className="flex flex-row flex-wrap gap-1 lg:flex-col">
        {items.map((it) => (
          <li key={it.key}>
            <a
              href={`#${it.key}`}
              className={cn(
                "block rounded-md px-3 py-1.5 text-sm transition-colors",
                active === it.key
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              {it.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
