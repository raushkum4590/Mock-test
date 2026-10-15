"use client";

export function PrintButton() {
  return (
    <button type="button" className="rounded-md border border-border bg-surface px-3 py-1 text-sm" onClick={() => window.print()}>
      Print
    </button>
  );
}
