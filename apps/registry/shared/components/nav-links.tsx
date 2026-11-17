import { BookOpen, Github, Play } from "lucide-react";

import {
  GradientLinkButton,
  IconLinkButton,
  NavLinkButton,
} from "@/shared/components/link-button";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { GITHUB_URL } from "@/shared/lib/site";

export function DocsLink() {
  return (
    <NavLinkButton href="/docs">
      <BookOpen className="size-3.5" />
      Docs
    </NavLinkButton>
  );
}

export function PlaygroundLink() {
  return (
    <GradientLinkButton href="/playground">
      <Play className="size-3.5" />
      Playground
    </GradientLinkButton>
  );
}

export function HeaderActions({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {children}
      <IconLinkButton href={GITHUB_URL} label="GitHub">
        <Github className="size-4" />
      </IconLinkButton>
      <ThemeToggle />
    </div>
  );
}
