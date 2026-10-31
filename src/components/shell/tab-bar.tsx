"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { MOBILE_TAB_ITEMS, isActivePath } from "@/lib/routes";

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="sz-tabbar lg:hidden" aria-label="Primary">
      <ul className="grid h-full grid-cols-5">
        {MOBILE_TAB_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 border-t-2 text-micro transition-colors duration-fast ease-out",
                  active
                    ? "border-brass text-brass"
                    : "border-transparent text-ink-muted hover:text-ink",
                )}
              >
                <Icon size={16} strokeWidth={1.5} aria-hidden />
                <span className="max-w-full truncate px-1">{item.tabLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
