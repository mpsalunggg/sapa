import { createHighlighter, type Highlighter } from "shiki"

export type CodeLang = "tsx" | "vue"

const THEMES = { light: "github-light", dark: "github-dark" } as const

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEMES.light, THEMES.dark],
      langs: ["tsx", "vue"],
    })
  }
  return highlighterPromise
}

export async function highlight(code: string, lang: CodeLang): Promise<string> {
  const highlighter = await getHighlighter()
  return highlighter.codeToHtml(code, {
    lang,
    themes: THEMES,
    defaultColor: false,
  })
}
