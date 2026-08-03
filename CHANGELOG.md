# Changelog

All notable changes to Sapa are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Sapa is a copy-paste registry, not an npm package — updating means re-copying the
files that changed, so every entry names them.

## [2.0.0] - 2026-08-03

One shape instead of many. The toast is now a single squared card — the icon
sits in a squared tile beside the header so the two read as one object, and the
description drops to its own full-width line instead of being indented under the
icon. Semantic color moved to the tile and to a bar along the bottom edge.

> **Breaking.** `variant`, `size` and `richColors` are gone. Delete them from
> your `toast()` calls and from `<Toaster>` — nothing replaces them, because
> `type` is the only visual axis now.

Re-copy: `toast-store.ts`, `toast.tsx`, `toaster.tsx` (React) and `useToast.ts`,
`Toast.vue`, `Toaster.vue` (Vue).

### Changed

- **One squared card replaces four variants, three sizes and two silhouettes.**
  The card is 9px radius with 14px padding all round. The icon lives in a 30px
  squared tile (8px radius) on the header row beside the title, and the
  description, actions and progress each start 11px below it at the card's full
  width — no longer indented under the icon. Semantic color is a soft wash of
  the type's `--sapa-*` token on that tile, with a hairline of the same hue, over
  a neutral surface. (`toast.tsx`, `Toast.vue`)
- **Both progress bars now take the type's color and ride the bottom edge.** The
  auto-dismiss countdown was a neutral grey pill floating above the card's floor;
  the determinate `progress` bar sat inside the content flow with a fixed
  warning→error gradient. Both are now a full-bleed 3px strip flush against the
  bottom border, painted from the type's `--sapa-*` token — `bg-foreground` for
  `default` and `loading`, which have no semantic hue. The root's
  `overflow-hidden` clips them to the card's radius. (`toast.tsx`, `Toast.vue`)
- **A `progress` value now hides the countdown bar.** They share the same strip
  of pixels, and a real percentage beats a timer. (`toast.tsx`, `Toast.vue`)

### Removed

- **`variant`** — the `default` / `outline` / `filled` / `accent` treatments and
  the `ToastVariant` type are gone, on both the toast options and `<Toaster>`.
  (`toast-store.ts`, `toast.tsx`, `toaster.tsx`, `useToast.ts`, `Toast.vue`,
  `Toaster.vue`)
- **`size`** — `sm` / `default` / `lg` and the `ToastSize` type are gone. The
  card has one set of measurements. (same six files)
- **`richColors`** — the deprecated alias for `variant: "outline"` is gone.
  Semantic colors are always on now, picked by `type`. (same six files)
- **The pill silhouette** — a title-only toast is the same squared card as any
  other, no longer a `rounded-full` pill. (`toast.tsx`, `Toast.vue`)
- **`react/toast-variants`, `react/toast-sizes`, `vue/toast-variants`,
  `vue/toast-sizes`** — these registry items no longer exist. Delete the example
  files if you installed them.

## [1.0.0] - 2026-08-02

First stable release. The toast API and the registry item names are stable from
here: anything that breaks them lands in 2.0.0.

### Added

- **Cross-framework toast** — one design, two authored sources. React
  (`toast-store.ts`, `toast.tsx`, `toaster.tsx`) and Vue (`useToast.ts`,
  `Toast.vue`, `Toaster.vue`) expose the same API.
- **Types** — `success`, `error`, `warning`, `info` and `loading`, each with its
  own semantic color and icon.
- **Variants** — `default`, `outline`, `filled` and `accent`. `richColors: true`
  is still accepted as a deprecated alias for `variant: "outline"`.
- **Sizes** — `sm`, `default` and `lg`.
- **Rich content** — `description`, `action`, `cancel`, custom icons, and fully
  custom bodies through `toast.custom()`.
- **`toast.promise()`** — a loading toast that resolves into success or error.
- **`toast.progress()`** — a determinate bar, updated by re-calling with the same id.
- **Six positions** — four corners plus top and bottom center, set per toast or as
  a `<Toaster>` default.
- **Stacked and flat layouts** — toasts collapse into a pile that expands on hover,
  or list flat with `<Toaster expand />`.
- **Swipe to dismiss** — sideways for corner positions, up or down for centered ones.
- **Theming** — every color is a CSS variable in `registry/theme/globals.css`, so
  light, dark and custom palettes need no component changes.
- **Accessibility** — `aria-live` announcements, a keyboard-focusable dismiss
  button, and animations that honor `prefers-reduced-motion`.
- **Showcase** — landing page, documentation, and a playground where the code is
  editable and the preview updates as you type.

### Fixed

- Hovering a stacked toast no longer drains its remaining time. One hover reached
  both the toast and its group container, and the elapsed time was subtracted once
  per call, so a toast hovered late in its life vanished the moment the cursor
  left. (`toast.tsx`, `Toast.vue`)
- `onAutoClose` now fires only when the duration runs out. It used to fire on every
  close path, including the close button, a swipe and action clicks.
  (`toast-store.ts`, `toast.tsx`, `useToast.ts`, `Toast.vue`)
- Closing a toast twice — a swipe racing the timer, or a double click on the close
  button — no longer fires its callbacks twice. (`toast.tsx`, `toast-store.ts`)
- `toast.dismiss(id)` now plays the exit animation instead of removing the toast
  instantly, matching what the close button already did. (`toast-store.ts`,
  `useToast.ts`)
- Auto-generated ids can no longer collide with a numeric id supplied by the
  caller. (`toast-store.ts`, `useToast.ts`)
- The Vue store no longer queues toasts while rendering on the server, where its
  module-level state was shared across requests. (`useToast.ts`)
- The stacked layout no longer nests a `<div>` inside `<ol>` — invalid markup that
  broke list semantics for screen readers. (`toaster.tsx`, `Toaster.vue`)
- A toast's countdown no longer restarts whenever an unrelated toast is added or
  the stack is hovered. (`toast.tsx`)

[2.0.0]: https://github.com/mpsalunggg/sapa/releases/tag/v2.0.0
[1.0.0]: https://github.com/mpsalunggg/sapa/releases/tag/v1.0.0
