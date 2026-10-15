import { createUserSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { createAdminUser, listAdminUsers } from "@/server/services/auth-service";

export const GET = route(async (req) => {
  await requireAdmin(req, "users.manage");
  return json({ users: await listAdminUsers() });
});

export const POST = route(async (req) => {
  const admin = await requireAdmin(req, "users.manage");
  return json(await createAdminUser(adminActor(admin, req), await parseBody(req, createUserSchema)), { status: 201 });
});
