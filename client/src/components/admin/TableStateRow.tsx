import type { ReactNode } from 'react';

export function TableStateRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-muted-foreground">
        {children}
      </td>
    </tr>
  );
}

export function RefreshingIndicator() {
  return (
    <p className="border-t border-border/70 px-4 py-2 text-center text-xs text-muted-foreground">
      Refreshing…
    </p>
  );
}
