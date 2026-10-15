export const metadata = { title: "Access denied" };

export default function DeniedPage() {
  return (
    <main className="mx-auto mt-20 max-w-md p-6 text-center">
      <h1 className="text-xl font-semibold">Access denied</h1>
      <p className="mt-2 text-sm text-muted">Your role does not include permission for that page.</p>
      <a href="/admin/dashboard" className="mt-4 inline-block text-sm text-primary underline">
        Back to dashboard
      </a>
    </main>
  );
}
