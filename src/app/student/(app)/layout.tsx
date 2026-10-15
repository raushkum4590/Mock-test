import Link from "next/link";
import { requireStudentPage } from "@/lib/auth/session";
import { getUiLang } from "@/lib/i18n/server-lang";
import { st } from "@/lib/i18n/site";
import { SiteFooter, SiteHeader } from "@/components/layout/site-shell";

export default async function StudentAppLayout({ children }: { children: React.ReactNode }) {
  await requireStudentPage();
  const lang = await getUiLang();
  const nav = [
    ["/student", st(lang, "overview")],
    ["/tests", st(lang, "navMockTests")],
    ["/study-material", st(lang, "navStudyMaterial")],
    ["/student/schedules", st(lang, "mySchedules")],
    ["/student/history", st(lang, "history")],
    ["/student/mistakes", st(lang, "incorrectPractice")],
    ["/student/bookmarks", st(lang, "bookmarks")],
    ["/student/profile", st(lang, "profile")],
  ] as const;
  return (
    <div className="flex min-h-screen flex-col" lang={lang}>
      <SiteHeader lang={lang} />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row">
        <nav aria-label="Student" className="no-print md:w-52 md:shrink-0">
          <ul className="flex gap-1 overflow-x-auto text-sm md:flex-col">
            {nav.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="block whitespace-nowrap rounded-md px-3 py-2 hover:bg-slate-100">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="min-w-0 flex-1 space-y-6">{children}</main>
      </div>
      <SiteFooter lang={lang} />
    </div>
  );
}
