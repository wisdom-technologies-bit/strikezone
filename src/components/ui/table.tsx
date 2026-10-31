import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Dense table: sticky header, hairline rows, horizontal scroll inside its box. */
export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("-mx-px overflow-x-auto rounded-table border border-line", className)}>
      <table className="w-full min-w-table border-collapse text-small">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="sticky top-0 z-10 bg-panel">{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TR({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn("border-b border-line last:border-b-0 hover:bg-raised", className)}>
      {children}
    </tr>
  );
}

export interface THProps extends ThHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}

export function TH({ children, numeric, className, ...rest }: THProps) {
  return (
    <th
      scope="col"
      className={cn(
        "h-control-md whitespace-nowrap border-b border-line-strong px-2 text-micro font-medium text-ink-muted",
        numeric ? "text-right" : "text-left",
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

export interface TDProps extends TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
  mono?: boolean;
}

export function TD({ children, numeric, mono = true, className, ...rest }: TDProps) {
  return (
    <td
      className={cn(
        "h-row-dense whitespace-nowrap px-2 text-ink",
        numeric ? "text-right" : "text-left",
        mono && numeric && "num",
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  );
}
