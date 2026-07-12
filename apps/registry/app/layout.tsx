import type { Metadata } from "next"
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google"

import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "./providers"

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sapa — Toast Registry",
  description:
    "A custom-built, cross-framework (React + Vue) toast registry. Copy, paste, own it.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${fontSans.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-svh font-sans antialiased [text-rendering:optimizeLegibility]">
        <Providers>
          {children}
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  )
}
