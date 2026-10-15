import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth/session";
import { countUsers } from "@/server/services/auth-service";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata = { title: "Administrator Login" };

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin/dashboard");
  const noUsers = (await countUsers()) === 0;
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <AdminLoginForm />
        {noUsers && (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            No administrator exists yet. Run <code>npm run admin:create -- --username admin --name &quot;Centre Admin&quot;</code> on the
            server{process.env.SETUP_TOKEN ? (
              <>
                , or use the <a className="underline" href="/setup">one-time setup page</a>
              </>
            ) : null}
            .
          </p>
        )}
      </div>
    </main>
  );
}
