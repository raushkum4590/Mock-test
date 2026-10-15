"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type MenuGroup = { label: string; items: { slug: string; name: string; tests: number }[] };

/** "Exams" mega-menu in the site header: every exam category, grouped (SSC, Banking, Railway, …). */
export function ExamsMenu({ label, groups, testsLabel }: { label: string; groups: MenuGroup[]; testsLabel: string }) {
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  // Close after navigating (derived: the menu belongs to the page it was opened on).
  const visible = open && openedAt === pathname;

  useEffect(() => {
    if (!visible) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [visible]);

  return (
    // Not positioned itself: the panel anchors to the sticky site header and spans its full width.
    <div ref={ref}>
      <button
        type="button"
        aria-expanded={visible}
        aria-haspopup="true"
        onClick={() => {
          setOpen(!visible);
          setOpenedAt(pathname);
        }}
        className="flex items-center gap-1 rounded-md px-3 py-1.5 font-medium hover:bg-slate-100"
      >
        {label}
        <span aria-hidden className={visible ? "rotate-180 transition" : "transition"}>
          ▾
        </span>
      </button>
      {visible && (
        <div className="absolute inset-x-0 top-full z-40 max-h-[75vh] overflow-y-auto border-b border-border bg-surface shadow-lg">
          <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-6 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
            {groups.map((g) => (
              <section key={g.label}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">{g.label}</h3>
                <ul className="space-y-0.5">
                  {g.items.map((it) => (
                    <li key={it.slug}>
                      <Link href={`/exams/${it.slug}`} className="flex items-baseline justify-between gap-2 rounded px-2 py-1 text-sm hover:bg-slate-100">
                        <span>{it.name}</span>
                        {it.tests > 0 && (
                          <span className="shrink-0 text-xs text-muted">
                            {it.tests} {testsLabel}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
