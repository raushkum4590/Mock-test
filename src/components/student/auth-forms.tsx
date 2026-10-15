"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Lang } from "@/lib/i18n/dictionary";
import { st } from "@/lib/i18n/site";
import { api } from "@/lib/client/api";
import { forgotPasswordSchema, resetPasswordSchema, studentLoginSchema, studentRegisterSchema } from "@/lib/validation/schemas";
import { Alert, Button, Field, Input, Select } from "@/components/ui";

/** Only allow same-site relative return paths (no open redirects). */
function safeNext(next: string | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/student";
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold">{title}</h1>
        {children}
      </div>
    </div>
  );
}

export function StudentLoginForm({ lang, next }: { lang: Lang; next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(studentLoginSchema) });
  return (
    <Shell title={st(lang, "loginTitle")}>
      <form
        className="space-y-4"
        noValidate
        onSubmit={handleSubmit(async (v) => {
          setError(null);
          try {
            await api("/api/student/login", { body: v });
            router.replace(safeNext(next));
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
          }
        })}
      >
        {error && <Alert tone="error">{error}</Alert>}
        <Field label={st(lang, "email")} error={formState.errors.email?.message}>
          <Input type="email" autoComplete="email" autoFocus {...register("email")} />
        </Field>
        <Field label={st(lang, "password")} error={formState.errors.password?.message}>
          <Input type="password" autoComplete="current-password" {...register("password")} />
        </Field>
        <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
          {st(lang, "navLogin")}
        </Button>
        <div className="flex justify-between text-sm">
          <Link href="/student/forgot-password" className="text-primary underline">
            {st(lang, "forgotPassword")}
          </Link>
          <span>
            {st(lang, "noAccount")}{" "}
            <Link href={`/student/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-primary underline">
              {st(lang, "navRegister")}
            </Link>
          </span>
        </div>
      </form>
    </Shell>
  );
}

export function StudentRegisterForm({ lang, next }: { lang: Lang; next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: { preferredLanguage: lang },
  });
  return (
    <Shell title={st(lang, "registerTitle")}>
      <form
        className="space-y-4"
        noValidate
        onSubmit={handleSubmit(async (v) => {
          setError(null);
          try {
            await api("/api/student/register", { body: v });
            router.replace(safeNext(next));
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
          }
        })}
      >
        {error && <Alert tone="error">{error}</Alert>}
        <Field label={st(lang, "fullName")} error={formState.errors.fullName?.message}>
          <Input autoComplete="name" autoFocus {...register("fullName")} />
        </Field>
        <Field label={st(lang, "email")} error={formState.errors.email?.message}>
          <Input type="email" autoComplete="email" {...register("email")} />
        </Field>
        <Field label={st(lang, "password")} hint="8+" error={formState.errors.password?.message}>
          <Input type="password" autoComplete="new-password" {...register("password")} />
        </Field>
        <Field label={st(lang, "preferredLanguage")}>
          <Select {...register("preferredLanguage")}>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </Select>
        </Field>
        <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? st(lang, "creating") : st(lang, "createAccount")}
        </Button>
        <p className="text-sm">
          {st(lang, "haveAccount")}{" "}
          <Link href={`/student/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-primary underline">
            {st(lang, "navLogin")}
          </Link>
        </p>
      </form>
    </Shell>
  );
}

export function ForgotPasswordForm({ lang }: { lang: Lang }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(forgotPasswordSchema) });
  return (
    <Shell title={st(lang, "resetTitle")}>
      {sent ? (
        <Alert tone="success">{st(lang, "resetSent")}</Alert>
      ) : (
        <form
          className="space-y-4"
          noValidate
          onSubmit={handleSubmit(async (v) => {
            setError(null);
            try {
              await api("/api/student/forgot", { body: v });
              setSent(true);
            } catch (e) {
              setError((e as Error).message);
            }
          })}
        >
          {error && <Alert tone="error">{error}</Alert>}
          <Field label={st(lang, "email")} error={formState.errors.email?.message}>
            <Input type="email" autoComplete="email" autoFocus {...register("email")} />
          </Field>
          <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
            {st(lang, "sendResetLink")}
          </Button>
        </form>
      )}
      <Link href="/student/login" className="mt-4 inline-block text-sm text-primary underline">
        {st(lang, "backToLogin")}
      </Link>
    </Shell>
  );
}

export function ResetPasswordForm({ lang, token }: { lang: Lang; token: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(resetPasswordSchema), defaultValues: { token } });
  return (
    <Shell title={st(lang, "setNewPassword")}>
      {done ? (
        <Alert tone="success">{st(lang, "passwordUpdated")}</Alert>
      ) : (
        <form
          className="space-y-4"
          noValidate
          onSubmit={handleSubmit(async (v) => {
            setError(null);
            try {
              await api("/api/student/reset", { body: v });
              setDone(true);
            } catch (e) {
              setError((e as Error).message);
            }
          })}
        >
          {error && <Alert tone="error">{error}</Alert>}
          <input type="hidden" {...register("token")} />
          <Field label={st(lang, "newPassword")} error={formState.errors.password?.message ?? formState.errors.token?.message}>
            <Input type="password" autoComplete="new-password" autoFocus {...register("password")} />
          </Field>
          <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
            {st(lang, "setNewPassword")}
          </Button>
        </form>
      )}
      <Link href="/student/login" className="mt-4 inline-block text-sm text-primary underline">
        {st(lang, "backToLogin")}
      </Link>
    </Shell>
  );
}
