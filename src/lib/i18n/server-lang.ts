import "server-only";
import { cookies } from "next/headers";
import { LANG_COOKIE } from "@/lib/auth/cookie-names";
import { getStudent } from "@/lib/auth/session";
import { normalizeLang, type Lang } from "./dictionary";

/** UI language for server-rendered public/student pages: student preference, then cookie, then English. */
export async function getUiLang(): Promise<Lang> {
  const student = await getStudent();
  if (student) return normalizeLang(student.preferredLanguage);
  return normalizeLang((await cookies()).get(LANG_COOKIE)?.value);
}
