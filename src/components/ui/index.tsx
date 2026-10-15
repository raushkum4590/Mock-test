/** Small, dependency-free UI primitives styled with Tailwind. */
import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

type Variant = "primary" | "secondary" | "danger" | "ghost" | "success";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:brightness-110 border-transparent",
  secondary: "bg-surface text-foreground border-border hover:bg-slate-50",
  danger: "bg-danger text-white hover:brightness-110 border-transparent",
  success: "bg-success text-white hover:brightness-110 border-transparent",
  ghost: "bg-transparent text-foreground border-transparent hover:bg-slate-100",
};

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" }>(
  function Button({ variant = "primary", size = "md", className, ...props }, ref) {
    return (
      <button
        ref={ref}
        className={cx(
          "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          size === "sm" ? "px-2.5 py-1 text-sm" : size === "lg" ? "px-5 py-2.5 text-base" : "px-4 py-2 text-sm",
          VARIANTS[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

const fieldBase =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-slate-100";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cx(fieldBase, className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cx(fieldBase, "min-h-20", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...props }, ref) {
  return <select ref={ref} className={cx(fieldBase, className)} {...props} />;
});

export function Field({ label, error, hint, children, className }: { label: string; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cx("flex flex-col gap-1 text-sm", className)}>
      <span className="font-medium text-foreground">{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-muted">{hint}</span>}
      {error && (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      )}
    </label>
  );
}

export function Card({ title, actions, children, className }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("rounded-lg border border-border bg-surface shadow-sm", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

const BADGE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SCHEDULED: "bg-sky-100 text-sky-800",
  PUBLISHED: "bg-indigo-100 text-indigo-800",
  WAITING: "bg-amber-100 text-amber-800",
  RUNNING: "bg-green-100 text-green-800",
  PAUSED: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-slate-200 text-slate-800",
  CANCELLED: "bg-red-100 text-red-800",
  READY: "bg-green-100 text-green-800",
  ARCHIVED: "bg-slate-200 text-slate-600",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  SUBMITTED: "bg-green-100 text-green-800",
  AUTO_SUBMITTED: "bg-teal-100 text-teal-800",
};

export function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  const key = tone ?? (typeof children === "string" ? children : "");
  return <span className={cx("inline-flex rounded px-2 py-0.5 text-xs font-semibold", BADGE[key] ?? "bg-slate-100 text-slate-700")}>{children}</span>;
}

export function Alert({ tone = "info", children }: { tone?: "info" | "error" | "success" | "warning"; children: ReactNode }) {
  const tones = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    error: "border-red-200 bg-red-50 text-red-900",
    success: "border-green-200 bg-green-50 text-green-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  };
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cx("rounded-md border px-3 py-2 text-sm", tones[tone])}>
      {children}
    </div>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm [&_td]:border-b [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_th]:border-b [&_th]:border-border [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold">
        {children}
      </table>
    </div>
  );
}

export { cx };
