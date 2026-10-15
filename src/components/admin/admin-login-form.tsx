"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Button, Field, Input } from "@/components/ui";
import { api } from "@/lib/client/api";
import { adminLoginSchema } from "@/lib/validation/schemas";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(adminLoginSchema) });
  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await api("/api/auth/admin/login", { body: values });
      router.replace("/admin/dashboard");
    } catch (e) {
      setError((e as Error).message);
    }
  });
  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-sm" noValidate>
      <h1 className="text-xl font-semibold">Administrator Login</h1>
      {error && <Alert tone="error">{error}</Alert>}
      <Field label="Username" error={formState.errors.username?.message}>
        <Input autoComplete="username" autoFocus {...register("username")} />
      </Field>
      <Field label="Password" error={formState.errors.password?.message}>
        <Input type="password" autoComplete="current-password" {...register("password")} />
      </Field>
      <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
