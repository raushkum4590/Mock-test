import { z } from "zod";
import { STUDENT_COOKIE } from "@/lib/auth/cookie-names";
import { AppError } from "@/lib/errors";
import { json, parseBody, requestMeta, route, setSessionCookie } from "@/server/http";
import { getPublicTestDetail, isGuestExam } from "@/server/services/practice-service";
import { startGuestSession } from "@/server/services/student-auth-service";

/** POST { fullName, slug } — name-only sign-in for guest tests (e.g. Tally Prime). */
export const POST = route(async (req) => {
  const { fullName, slug } = await parseBody(req, z.object({ fullName: z.string().trim().min(2, "Enter your name").max(150), slug: z.string().min(1).max(80) }));
  const d = await getPublicTestDetail(slug);
  if (!(await isGuestExam({ accessLevel: d.exam.accessLevel, categoryId: d.exam.categoryId }))) {
    throw new AppError("FORBIDDEN", "Please register or log in to take this test.");
  }
  const { token, expiresAt } = await startGuestSession(fullName, requestMeta(req));
  const res = json({ next: `/student/tests/${slug}` }, { status: 201 });
  setSessionCookie(res, STUDENT_COOKIE, token, expiresAt);
  return res;
});
