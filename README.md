# Sapa

Your own cross-framework component **registry** — shadcn-style, installable with a
single command in **React** _and_ **Vue**. v1 ships a **custom-built toast system**
(no `sonner` / `vue-sonner` — written from scratch on framework primitives).

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
pnpm registry:build        # generate apps/registry/public/r/*.json
pnpm dev                   # Next.js showcase → http://localhost:3000
pnpm sandbox               # Vue sandbox     → http://localhost:5174
```

`pnpm dev` runs `registry:build` automatically (via the app's `predev` hook).

## Consume the registry

Serve the built JSON (locally the Next app serves `public/r/*`), then:

```bash
# React
npx shadcn@latest add http://localhost:3000/r/react/toaster.json
npx shadcn@latest add http://localhost:3000/r/react/toast-types.json

# Vue
npx shadcn-vue@latest add http://localhost:3000/r/vue/toaster.json
npx shadcn-vue@latest add http://localhost:3000/r/vue/toast-types.json
```

Then mount the toaster once and call the API anywhere:

```tsx
// React
import { Toaster, toast } from "@/components/ui/toaster"
// <Toaster richColors />
toast.success("Saved", { description: "All changes stored." })
```

```vue
<!-- Vue -->
<script setup>
import Toaster from "@/components/ui/Toaster.vue"
import { toast } from "@/components/ui/useToast"
</script>
<template><Toaster rich-colors /></template>
<!-- toast.success("Saved", { description: "All changes stored." }) -->
```

## Toast API (identical in both frameworks)

`toast(msg, opts)` · `toast.success/error/warning/info(msg, opts)` ·
`toast.loading` · `toast.promise(p, { loading, success, error })` ·
`toast.custom(node/component)` · `toast.dismiss(id?)`

Options: `title`, `description`, `duration` (`Infinity` to persist), `position`,
`richColors`, `action`, `cancel`, `icon`.

## Deploy

Set `SAPA_BASE_URL` to your public origin before building so registry URLs and
install commands point at production:

```bash
SAPA_BASE_URL=https://your-domain.com pnpm registry:build
```
