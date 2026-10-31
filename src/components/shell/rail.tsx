"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, isActivePath } from "@/lib/routes";

export interface RailProps {
  expanded: boolean;
  onToggle: () => void;
}

export function Rail({ expanded, onToggle }: RailProps) {
  const pathname = usePathname();

  return (
    <aside
      className="sz-rail hidden flex-col justify-between py-2 lg:flex"
      aria-label="Primary"
      data-expanded={expanded}
    >
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={expanded ? undefined : item.label}
              className={cn(
                "tap-target mx-1 flex h-control-lg items-center gap-2 rounded-control border-l-2 px-2 text-small transition-colors duration-fast ease-out",
                active
                  ? "border-brass bg-raised text-ink"
                  : "border-transparent text-ink-muted hover:bg-raised hover:text-ink",
                !expanded && "justify-center px-0",
              )}
            >
              <Icon size={16} strokeWidth={1.5} aria-hidden className="shrink-0" />
              {expanded ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
        className={cn(
          "tap-target mx-1 flex h-control-lg items-center gap-2 rounded-control border border-transparent px-2 text-small text-ink-faint transition-colors duration-fast ease-out hover:bg-raised hover:text-ink",
          !expanded && "justify-center px-0",
        )}
      >
        {expanded ? (
          <PanelLeftClose size={16} strokeWidth={1.5} aria-hidden />
        ) : (
          <PanelLeftOpen size={16} strokeWidth={1.5} aria-hidden />
        )}
        {expanded ? <span>Collapse</span> : null}
      </button>
    </aside>
  );
}
