import { redirect } from "next/navigation";
import { connection } from "next/server";
import { countUsers } from "@/server/services/auth-service";
import { SetupForm } from "@/components/admin/setup-form";

export const metadata = { title: "First-time setup" };

export default async function SetupPage() {
  // Request-time only: never query the database during `next build`.
  await connection();
  if ((await countUsers()) > 0) redirect("/admin/login");
  if (!process.env.SETUP_TOKEN) {
    return (
      <main className="mx-auto mt-20 max-w-lg p-6 text-sm">
        <h1 className="text-xl font-semibold">Web setup is disabled</h1>
        <p className="mt-2">
          Create the first administrator on the server: <code>npm run admin:create -- --username admin --name &quot;Centre Admin&quot;</code>
        </p>
      </main>
    );
  }
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <SetupForm />
    </main>
  );
}
