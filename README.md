# Sapa.

Your own cross-framework component **registry** — a custom-built toast you install into **React** & **Vue** with one command.

_Copy, paste, own it. Same design, two frameworks._

![Sapa — a toast system you own, for React and Vue](assets/web.png)

---

## Features

- **Cross-framework** — one registry, two authored sources (`.tsx` + `.vue`).
- **Custom-built** — written from scratch on framework primitives (no `sonner` / `vue-sonner`).
- **Rich colors** — semantic success / error / warning / info, in three variants: `solid`, `minimal` (default) and `subtle`.
- **Bubble motion** — every toast pops in as a pill (icon + title), then morphs into a card to reveal the description and actions. Springs powered by [Motion](https://motion.dev) (`motion` for React, `motion-v` for Vue).
- **Directional motion** — toasts exit toward their anchor; swipe to dismiss (sideways for corners, up/down for centered).
- **Examples** — default, types, description, action, promise, progress, custom content, positions.
- **Theme-aware** — light & dark via CSS variables.
- **Accessible** — `aria-live` announcements, keyboard-focusable dismiss, honors `prefers-reduced-motion`.

## Install into your project

The registry is served as JSON. Add it with the shadcn CLI:

```bash
# React
npx shadcn@latest add https://sapa-registry.vercel.app/r/react/toaster.json

# Vue
npx shadcn-vue@latest add https://sapa-registry.vercel.app/r/vue/toaster.json
```

Files land in `components/ui/sapa-toast/`. Optional demo examples:
`.../r/react/toast-types.json`, `toast-promise.json`, `toast-positions.json`, …

Mount the toaster once, then call the API anywhere:

```tsx
// React — e.g. app/layout.tsx
import { Toaster, toast } from "@/components/ui/sapa-toast/toaster";

// <Toaster position="bottom-right" />
toast.success("Saved", { description: "All changes stored." });
```

```vue
<!-- Vue — e.g. App.vue -->
<script setup>
import Toaster from "@/components/ui/sapa-toast/Toaster.vue";
import { toast } from "@/components/ui/sapa-toast/useToast";
</script>

<template>
  <Toaster position="bottom-right" />
</template>
<!-- toast.success("Saved", { description: "All changes stored." }) -->
```

## Toast API (identical in both frameworks)

`toast(msg, opts)` · `toast.success / error / warning / info(msg, opts)` ·
`toast.loading` · `toast.progress(msg, { value })` ·
`toast.promise(p, { loading, success, error })` ·
`toast.custom(node/component)` · `toast.dismiss(id?)`

**Options:** `title`, `description`, `duration` (`Infinity` to persist), `position`, `variant`,
`action`, `cancel`, `icon`, `progress` (0–100).

Every toast is the same bubble — there is no `size` to pick. It
appears as a pill holding the icon and title, and after ~450 ms (or right away
on hover) opens into a card for the description, actions and progress bar. A
title-only toast stays a pill. The only visual axis is `type`, which pulls a
color from the `--sapa-*` tokens and uses it on the round icon tile and the thin
countdown ring around it — or, when you pass `progress`, the determinate fill.
`variant` picks how that color is carried — set it per toast or as a
`<Toaster variant>` default:

- `minimal` _(default)_ — neutral glass surface; color only on the icon and ring.
- `subtle` — the whole bubble takes a light, opaque tint of the type's color; made for light, dense UIs.
- `solid` — the bubble is filled with the color, and text, icon and buttons switch to its foreground.

`<Toaster>` takes `position`, `expand` and `variant`.

## Repository layout

```
sapa/
├── registry.json              # source of truth — every item (React + Vue)
├── registry/
│   ├── theme/globals.css      # shared design tokens (framework-agnostic)
│   ├── react/                 # .tsx toast: store + <Toaster/> + <Toast/> + examples
│   └── vue/                   # .vue toast: reactive store + Toaster/Toast + examples
├── scripts/build-registry.mjs # inlines files → apps/registry/public/r/*.json
└── apps/
    ├── registry/              # Next.js showcase (live React preview, code + CLI copy)
    └── vue-sandbox/           # Vite + Vue app to verify the .vue items render
```

## Develop

```bash
pnpm install
pnpm dev            # Next.js showcase → http://localhost:3000  (auto-runs registry:build)
pnpm sandbox        # Vue sandbox      → http://localhost:5174
pnpm registry:build # regenerate apps/registry/public/r/*.json
```

## Changelog

Every release and the files it touched: [CHANGELOG.md](CHANGELOG.md) ·
[sapa-registry.vercel.app/changelog](https://sapa-registry.vercel.app/changelog)

Sapa is copy-paste — when you update, re-copy the files each entry names.

## License

MIT © Muhamad Putra Satria
