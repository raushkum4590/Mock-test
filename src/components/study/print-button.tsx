"use client";

/** Opens the browser's print dialog (students can choose "Save as PDF"). */
export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:border-primary hover:text-primary"
    >
      {label}
    </button>
  );
}
