import { requireStudentPage } from "@/lib/auth/session";
import { normalizeLang } from "@/lib/i18n/dictionary";
import { getUiLang } from "@/lib/i18n/server-lang";
import { st } from "@/lib/i18n/site";
import { getStudentProfile } from "@/server/services/student-auth-service";
import { ProfileForm } from "@/components/student/student-widgets";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const student = await requireStudentPage("/student/profile");
  const lang = await getUiLang();
  const p = await getStudentProfile(student.studentId);
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h1 className="mb-1 text-xl font-semibold">{st(lang, "profile")}</h1>
      <p className="mb-4 text-sm text-muted">{p.email}</p>
      <ProfileForm
        lang={lang}
        defaults={{ fullName: p.fullName, displayName: p.displayName, preferredLanguage: normalizeLang(p.preferredLanguage), showOnLeaderboard: p.showOnLeaderboard }}
      />
    </section>
  );
}
