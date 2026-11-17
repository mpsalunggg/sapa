# Changelog

All notable changes to Sapa are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Sapa is a copy-paste registry, not an npm package. Updating means re-copying the
files that changed, so every entry names them.

## [2.1.0] - 2026-11-17

The toast is now a bubble. It appears as a pill with the icon and title, then
opens into a card for the description, actions and progress. The springs come
from [Motion](https://motion.dev). You can pick a color treatment again with
`variant`, and the old grid of shapes and sizes stays gone.

> **Heads-up.** The toaster now depends on `motion` (React) or `motion-v` (Vue),
> and the theme keyframe `sapa-toast-progress` is renamed to `sapa-toast-ring`.
> Re-copy the theme along with the toaster files, and install the new package.

Re-copy: `globals.css` (theme), `toast-store.ts`, `toast.tsx`, `toaster.tsx`
(React) and `useToast.ts`, `Toast.vue`, `Toaster.vue` (Vue).

### Added

- `variant` takes `minimal` _(default)_, `subtle` or `solid`, per toast or as a
  `<Toaster variant>` default. `minimal` keeps a neutral glass surface with color
  only on the icon and ring. `subtle` tints the whole bubble with a light, opaque
  wash of the type's color. `solid` fills it with the color and switches the
  text, icon and buttons to its foreground. The type is exported as
  `ToastVariant`. (`toast-store.ts`, `toast.tsx`, `toaster.tsx`, `useToast.ts`,
  `Toast.vue`, `Toaster.vue`)
- `react/toast-variants` and `vue/toast-variants` are new registry examples that
  show the three variants side by side.

### Changed

- Every toast pops in as a pill (icon and title) and, after about 450 ms or as
  soon as you hover, grows into a card with the description, actions and
  progress. A title-only toast stays a pill. (`toast.tsx`, `Toast.vue`)
- The countdown is a thin ring in the type's color that drains around the round
  icon tile, replacing the 3px bar along the bottom edge. A `progress` value
  shows a bar inside the card instead and turns the countdown off. (`toast.tsx`,
  `Toast.vue`, `globals.css`)
- The `react/toaster` and `vue/toaster` registry items now depend on `motion`
  and `motion-v` respectively.
- The theme keyframe `sapa-toast-progress` (scaleX) is now `sapa-toast-ring`
  (stroke-dashoffset). (`globals.css`)

## [2.0.0] - 2026-08-03

The toast has one shape now, a squared card. The icon sits in a squared tile
beside the header, and the description gets its own full-width line instead of
being indented under the icon. Semantic color moved to the tile and to a bar
along the bottom edge.

> **Breaking.** `variant`, `size` and `richColors` are gone. Delete them from
> your `toast()` calls and from `<Toaster>`. Nothing replaces them, because
> `type` is the only visual option now.

Re-copy: `toast-store.ts`, `toast.tsx`, `toaster.tsx` (React) and `useToast.ts`,
`Toast.vue`, `Toaster.vue` (Vue).

### Changed

- One squared card replaces four variants, three sizes and two silhouettes. The
  card has a 9px radius and 14px padding on every side. The icon lives in a 30px
  squared tile (8px radius) on the header row beside the title. The description,
  actions and progress each start 11px below it and use the card's full width
  instead of being indented under the icon. Semantic color is a soft wash of the
  type's `--sapa-*` token on that tile, with a hairline of the same hue, over a
  neutral surface. (`toast.tsx`, `Toast.vue`)
- Both progress bars now use the type's color and sit on the bottom edge. The
  auto-dismiss countdown used to be a neutral grey pill floating above the
  card's floor, and the determinate `progress` bar sat inside the content with a
  fixed warning-to-error gradient. Both are now a full-bleed 3px strip flush
  against the bottom border, painted from the type's `--sapa-*` token, or
  `bg-foreground` for `default` and `loading`, which have no semantic hue. The
  root's `overflow-hidden` clips them to the card's radius. (`toast.tsx`,
  `Toast.vue`)
- A `progress` value now hides the countdown bar. Both use the same strip, and
  the real percentage is more useful than the timer. (`toast.tsx`, `Toast.vue`)

### Removed

- `variant`: the `default`, `outline`, `filled` and `accent` treatments and the
  `ToastVariant` type are gone from both the toast options and `<Toaster>`.
  (`toast-store.ts`, `toast.tsx`, `toaster.tsx`, `useToast.ts`, `Toast.vue`,
  `Toaster.vue`)
- `size`: `sm`, `default`, `lg` and the `ToastSize` type are gone. The card has
  one set of measurements. (same six files)
- `richColors`: the deprecated alias for `variant: "outline"` is gone. Semantic
  colors are always on and follow `type`. (same six files)
- The pill silhouette: a title-only toast is the same squared card as any other
  instead of a `rounded-full` pill. (`toast.tsx`, `Toast.vue`)
- The `react/toast-variants`, `react/toast-sizes`, `vue/toast-variants` and
  `vue/toast-sizes` registry items no longer exist. Delete the example files if
  you installed them.

## [1.0.0] - 2026-08-02

First stable release. The toast API and the registry item names are stable from
here, and anything that breaks them lands in 2.0.0.

### Added

- A cross-framework toast with one design and two hand-written sources. React
  (`toast-store.ts`, `toast.tsx`, `toaster.tsx`) and Vue (`useToast.ts`,
  `Toast.vue`, `Toaster.vue`) expose the same API.
- `success`, `error`, `warning`, `info` and `loading` types, each with its own
  semantic color and icon.
- `default`, `outline`, `filled` and `accent` variants. `richColors: true` still
  works as a deprecated alias for `variant: "outline"`.
- `sm`, `default` and `lg` sizes.
- `description`, `action`, `cancel`, custom icons, and fully custom bodies
  through `toast.custom()`.
- `toast.promise()`, a loading toast that turns into success or error.
- `toast.progress()`, a determinate bar you update by calling it again with the
  same id.
- Six positions (the four corners plus top and bottom center), set per toast or
  as a `<Toaster>` default.
- Stacked and flat layouts. Toasts collapse into a pile that expands on hover,
  or list flat with `<Toaster expand />`.
- Swipe to dismiss, sideways for corner positions and up or down for centered
  ones.
- Every color is a CSS variable in `registry/theme/globals.css`, so light, dark
  and custom palettes need no component changes.
- `aria-live` announcements, a dismiss button you can reach with the keyboard,
  and animations that respect `prefers-reduced-motion`.
- A showcase site with a landing page, documentation, and a playground where you
  edit the code and the preview updates as you type.

### Fixed

- Hovering a stacked toast no longer drains its remaining time. One hover reached
  both the toast and its group container, and the elapsed time was subtracted once
  per call, so a toast hovered late in its life vanished the moment the cursor
  left. (`toast.tsx`, `Toast.vue`)
- `onAutoClose` now fires only when the duration runs out. It used to fire on every
  close path, including the close button, a swipe and action clicks.
  (`toast-store.ts`, `toast.tsx`, `useToast.ts`, `Toast.vue`)
- Closing a toast twice, for example a swipe racing the timer or a double click
  on the close button, no longer fires its callbacks twice. (`toast.tsx`,
  `toast-store.ts`)
- `toast.dismiss(id)` now plays the exit animation instead of removing the toast
  instantly, the same as the close button. (`toast-store.ts`, `useToast.ts`)
- Auto-generated ids can no longer collide with a numeric id supplied by the
  caller. (`toast-store.ts`, `useToast.ts`)
- The Vue store no longer queues toasts while rendering on the server, where its
  module-level state was shared across requests. (`useToast.ts`)
- The stacked layout no longer nests a `<div>` inside `<ol>`. That markup was
  invalid and broke list semantics for screen readers. (`toaster.tsx`,
  `Toaster.vue`)
- A toast's countdown no longer restarts whenever an unrelated toast is added or
  the stack is hovered. (`toast.tsx`)

[2.1.0]: https://github.com/mpsalunggg/sapa/releases/tag/v2.1.0
[2.0.0]: https://github.com/mpsalunggg/sapa/releases/tag/v2.0.0
[1.0.0]: https://github.com/mpsalunggg/sapa/releases/tag/v1.0.0
