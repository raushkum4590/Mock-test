"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/lib/client/api";
import { setupSchema } from "@/lib/validation/schemas";
import { Alert, Button, Field, Input } from "@/components/ui";

export function SetupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(setupSchema) });
  return (
    <form
      onSubmit={handleSubmit(async (v) => {
        setError(null);
        try {
          await api("/api/auth/setup", { body: v });
          router.replace("/admin/login");
        } catch (e) {
          setError((e as Error).message);
        }
      })}
      className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-surface p-6 shadow-sm"
      noValidate
    >
      <h1 className="text-xl font-semibold">Create the first Super Admin</h1>
      <p className="text-xs text-muted">Requires the SETUP_TOKEN from the server&apos;s .env. Works only while no administrator exists.</p>
      {error && <Alert tone="error">{error}</Alert>}
      <Field label="Setup token" error={formState.errors.token?.message}>
        <Input type="password" {...register("token")} />
      </Field>
      <Field label="Username" error={formState.errors.username?.message}>
        <Input {...register("username")} />
      </Field>
      <Field label="Full name" error={formState.errors.fullName?.message}>
        <Input {...register("fullName")} />
      </Field>
      <Field label="Password (min 10 characters)" error={formState.errors.password?.message}>
        <Input type="password" autoComplete="new-password" {...register("password")} />
      </Field>
      <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
        Create administrator
      </Button>
    </form>
  );
}
