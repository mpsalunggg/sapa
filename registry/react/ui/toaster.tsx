"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"
import { Toast } from "./toast"
import {
  toastStore,
  type ToastData,
  type ToastPosition,
} from "./toast-store"

// Stable reference for SSR: getServerSnapshot must return the same value every
// call, otherwise useSyncExternalStore re-renders forever.
const EMPTY: ToastData[] = []

const POSITION_CLASSES: Record<ToastPosition, string> = {
  "top-left": "top-0 left-0 sm:items-start",
  "top-center": "top-0 left-1/2 -translate-x-1/2 sm:items-center",
  "top-right": "top-0 right-0 sm:items-end",
  "bottom-left": "bottom-0 left-0 flex-col-reverse sm:items-start",
  "bottom-center":
    "bottom-0 left-1/2 -translate-x-1/2 flex-col-reverse sm:items-center",
  "bottom-right": "bottom-0 right-0 flex-col-reverse sm:items-end",
}

export interface ToasterProps {
  /** Default position for toasts that don't set their own. */
  position?: ToastPosition
  /** Apply the semantic --sapa-* colors to every toast by default. */
  richColors?: boolean
}

export function Toaster({
  position = "bottom-right",
  richColors = false,
}: ToasterProps) {
  const toasts = React.useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    () => EMPTY
  )
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null

  // Group toasts by their effective position.
  const groups = new Map<ToastPosition, ToastData[]>()
  for (const t of toasts) {
    const pos = t.position ?? position
    if (!groups.has(pos)) groups.set(pos, [])
    groups.get(pos)!.push(t)
  }

  return createPortal(
    <>
      {[...groups.entries()].map(([pos, items]) => (
        <ol
          key={pos}
          className={cn(
            "pointer-events-none fixed z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[380px]",
            POSITION_CLASSES[pos]
          )}
        >
          {items.map((t) => (
            <Toast
              key={t.id}
              toast={{ ...t, richColors: t.richColors ?? richColors }}
            />
          ))}
        </ol>
      ))}
    </>,
    document.body
  )
}

export { toast } from "./toast-store"
