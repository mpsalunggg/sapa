"use client";

import { useEffect, useState } from "react";

import { FrameworkSwitch } from "@/shared/framework/framework-switch";
import {
  ActiveBar,
  navItemClass,
  SidebarLabel,
} from "@/shared/components/sidebar";

export interface TocItem {
  key: string;
  title: string;
}

export interface TocGroup {
  label: string;
  items: TocItem[];
}

export function DocsToc({ groups }: { groups: TocGroup[] }) {
  const [active, setActive] = useState(groups[0]?.items[0]?.key);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-15% 0px -75% 0px", threshold: 0 },
    );
    for (const item of groups.flatMap((g) => g.items)) {
      const el = document.getElementById(item.key);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [groups]);

  return (
    <nav className="lg:sticky lg:top-6">
      <div className="mb-5">
        <SidebarLabel>Framework</SidebarLabel>
        <div className="px-3">
          <FrameworkSwitch />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <div key={group.label}>
            <SidebarLabel bullet>{group.label}</SidebarLabel>
            <ul className="flex flex-row flex-wrap gap-1 lg:flex-col">
              {group.items.map((it) => (
                <li key={it.key}>
                  <a
                    href={`#${it.key}`}
                    className={navItemClass(active === it.key)}
                  >
                    {active === it.key && <ActiveBar />}
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
