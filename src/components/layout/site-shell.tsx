import Link from "next/link";
import { getStudent } from "@/lib/auth/session";
import type { Lang } from "@/lib/i18n/dictionary";
import { BRAND, st } from "@/lib/i18n/site";
import { GROUP_LABELS, GROUP_LABELS_HI, libraryCategories, type ExamGroup } from "@/lib/exam-patterns";
import { listCategories } from "@/server/services/practice-service";
import { ExamsMenu, type MenuGroup } from "./exams-menu";
import { SiteLangSwitch, StudentLogoutButton } from "./site-lang-switch";

/**
 * Every exam of the pattern library grouped (SSC, Banking, …), with names and
 * test counts from the database; categories created only by admins go under "Other".
 */
function menuGroups(categories: Awaited<ReturnType<typeof listCategories>>, lang: Lang): MenuGroup[] {
  const db = new Map(categories.map((c) => [c.slug, c]));
  const name = (en: string, hi: string | null | undefined) => (lang === "hi" && hi ? hi : en);
  const groups = new Map<ExamGroup, MenuGroup>();
  for (const c of libraryCategories()) {
    const g = groups.get(c.group) ?? { label: lang === "hi" ? GROUP_LABELS_HI[c.group] : GROUP_LABELS[c.group], items: [] };
    const row = db.get(c.slug);
    g.items.push({ slug: c.slug, name: row ? name(row.nameEn, row.nameHi) : name(c.nameEn, c.nameHi), tests: row?.testCount ?? 0 });
    groups.set(c.group, g);
  }
  const library = new Set(libraryCategories().map((c) => c.slug));
  const other = categories.filter((c) => !library.has(c.slug)).map((c) => ({ slug: c.slug, name: name(c.nameEn, c.nameHi), tests: c.testCount }));
  const out = [...groups.values()];
  if (other.length) out.push({ label: lang === "hi" ? "अन्य" : "Other", items: other });
  return out;
}

/** Header for the public site and student area. */
export async function SiteHeader({ lang }: { lang: Lang }) {
  const student = await getStudent();
  const categories = await listCategories();
  return (
    <header className="no-print sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-primary text-white">
            {BRAND.charAt(0)}
          </span>
          <span className="text-lg">{BRAND}</span>
        </Link>
        <nav aria-label="Main" className="flex flex-1 flex-wrap items-center gap-1 text-sm">
          <ExamsMenu label={st(lang, "navExams")} groups={menuGroups(categories, lang)} testsLabel={st(lang, "testsShort")} />
          <Link href="/tests?access=free" className="rounded-md px-3 py-1.5 hover:bg-slate-100">
            {st(lang, "navFreeTests")}
          </Link>
          <Link href="/study-material" className="rounded-md px-3 py-1.5 hover:bg-slate-100">
            {st(lang, "navStudyMaterial")}
          </Link>
          <Link href="/help" className="rounded-md px-3 py-1.5 hover:bg-slate-100">
            {st(lang, "navHelp")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <SiteLangSwitch lang={lang} loggedIn={!!student} />
          {student ? (
            <>
              <Link href="/student" className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white">
                {st(lang, "navDashboard")}
              </Link>
              <StudentLogoutButton label={st(lang, "navLogout")} />
            </>
          ) : (
            <>
              <Link href="/student/login" className="rounded-md px-3 py-1.5 text-sm hover:bg-slate-100">
                {st(lang, "navLogin")}
              </Link>
              <Link href="/student/register" className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white">
                {st(lang, "navRegister")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="no-print mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-muted">
        <p>
          © {BRAND} · {st(lang, "independent")}
        </p>
        <nav className="flex gap-4">
          <Link href="/help">{st(lang, "navHelp")}</Link>
          <Link href="/admin/login">Admin</Link>
          <Link href="/login">Exam centre login</Link>
        </nav>
      </div>
    </footer>
  );
}
