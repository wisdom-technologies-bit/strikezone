"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  items: readonly TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  label: string;
  className?: string;
}

/** Compact underline tabs. No pill, no fill; the underline is the state. */
export function Tabs({ items, value, onValueChange, children, label, className }: TabsProps) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange} className={className}>
      <TabsPrimitive.List
        aria-label={label}
        className="flex min-h-control-md items-stretch gap-1 overflow-x-auto border-b border-line"
      >
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            className={cn(
              "tap-target -mb-px inline-flex shrink-0 items-center gap-1 whitespace-nowrap border-b-2 border-transparent px-2 text-small text-ink-muted transition-colors duration-fast ease-out",
              "hover:text-ink",
              "data-[state=active]:border-brass data-[state=active]:text-ink",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {item.label}
            {typeof item.count === "number" ? (
              <span className="num text-micro text-ink-faint">{item.count}</span>
            ) : null}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {children}
    </TabsPrimitive.Root>
  );
}

export function TabPanel({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <TabsPrimitive.Content value={value} className={cn("pt-3 focus:outline-none", className)}>
      {children}
    </TabsPrimitive.Content>
  );
}
