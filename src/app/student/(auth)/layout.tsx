import { getUiLang } from "@/lib/i18n/server-lang";
import { SiteFooter, SiteHeader } from "@/components/layout/site-shell";

export default async function StudentAuthLayout({ children }: { children: React.ReactNode }) {
  const lang = await getUiLang();
  return (
    <div className="flex min-h-screen flex-col" lang={lang}>
      <SiteHeader lang={lang} />
      <main className="flex-1">{children}</main>
      <SiteFooter lang={lang} />
    </div>
  );
}
