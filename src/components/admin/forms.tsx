"use client";

/**
 * Admin forms. Client-side validation uses the same Zod schemas as the API,
 * which re-validates everything server-side.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm, useWatch, type FieldValues } from "react-hook-form";
import { api } from "@/lib/client/api";
import {
  batchSchema,
  categorySchema,
  centreSchema,
  entitlementSchema,
  seriesSchema,
  TEST_KINDS,
  candidateSchema,
  createUserSchema,
  DIFFICULTIES,
  EXAM_TYPES,
  examSchema,
  questionSchema,
  scheduleSchema,
  sectionSchema,
  workstationSchema,
} from "@/lib/validation/schemas";
import { ROLE_CODES, ROLES } from "@/lib/permissions";
import { Alert, Button, Field, Input, Select, Textarea } from "@/components/ui";

function useSubmitter<T extends FieldValues>(
  url: string,
  method: "POST" | "PUT" = "POST",
  onSuccess?: (r: unknown, v: T, notify: (msg: string) => void) => void,
) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const submit = async (values: T) => {
    setError(null);
    setNotice(null);
    try {
      const r = await api(url, { method, body: values });
      onSuccess?.(r, values, setNotice);
      router.refresh();
      return r;
    } catch (e) {
      const err = e as Error & { details?: { path: string; message: string }[] };
      setError(err.message + (Array.isArray(err.details) ? " " + err.details.map((d) => `${d.path}: ${d.message}`).join("; ") : ""));
      throw e;
    }
  };
  return { submit, error, notice };
}

const err = (e: unknown) => (e as { message?: string } | undefined)?.message;

// --- Exam ------------------------------------------------------------------------

type Option = { id: string; label: string };

export function ExamForm({
  examId,
  defaults,
  categories = [],
  series = [],
}: {
  examId?: string;
  defaults?: Record<string, unknown>;
  categories?: Option[];
  series?: Option[];
}) {
  const router = useRouter();
  const { register, handleSubmit, formState, reset } = useForm({
    resolver: zodResolver(examSchema),
    defaultValues:
      (defaults as never) ??
      {
        examType: "SSC_CGL",
        defaultDurationMinutes: 60,
        allowAnswerReview: false,
        testKind: "FULL",
        accessLevel: "FREE",
        timed: true,
        maxAttempts: 0,
        resultPolicy: "IMMEDIATE",
        isPublic: true,
      },
  });
  const s = useSubmitter(examId ? `/api/exams/${examId}` : "/api/exams", examId ? "PUT" : "POST", (r, _v, notify) => {
    if (!examId) {
      reset();
      router.push(`/admin/exams/${(r as { id: string }).id}`);
    } else notify("Saved.");
  });
  return (
    <form onSubmit={handleSubmit((v) => s.submit(v).catch(() => {}))} className="grid grid-cols-1 gap-3 md:grid-cols-2" noValidate>
      {s.error && <div className="md:col-span-2"><Alert tone="error">{s.error}</Alert></div>}
      {s.notice && <div className="md:col-span-2"><Alert tone="success">{s.notice}</Alert></div>}
      <Field label="Exam code" error={err(formState.errors.code)}>
        <Input {...register("code")} placeholder="CGL-MOCK-02" />
      </Field>
      <Field label="Exam type" error={err(formState.errors.examType)}>
        <Select {...register("examType")}>
          {EXAM_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Title (English)" error={err(formState.errors.titleEn)}>
        <Input {...register("titleEn")} />
      </Field>
      <Field label="Title (Hindi)" error={err(formState.errors.titleHi)}>
        <Input lang="hi" {...register("titleHi")} />
      </Field>
      <Field label="Default duration (minutes)" error={err(formState.errors.defaultDurationMinutes)}>
        <Input type="number" min={1} {...register("defaultDurationMinutes")} />
      </Field>
      <label className="flex items-center gap-2 self-end text-sm">
        <input type="checkbox" {...register("allowAnswerReview")} /> Allow answer review after completion
      </label>
      <Field label="Instructions (English)" className="md:col-span-2">
        <Textarea rows={5} {...register("instructionsEn")} />
      </Field>
      <Field label="Instructions (Hindi)" className="md:col-span-2">
        <Textarea rows={5} lang="hi" {...register("instructionsHi")} />
      </Field>

      <fieldset className="grid grid-cols-1 gap-3 rounded-md border border-border p-3 md:col-span-2 md:grid-cols-3">
        <legend className="px-1 text-sm font-semibold">Online mock test (students)</legend>
        <label className="flex items-center gap-2 text-sm md:col-span-3">
          <input type="checkbox" {...register("isPublic")} /> Show to students (on by default — appears as soon as it has questions; untick to hide)
        </label>
        <Field label="URL slug" hint="Optional — generated from the title if left blank" error={err(formState.errors.slug)}>
          <Input {...register("slug")} />
        </Field>
        <Field label="Exam category">
          <Select {...register("categoryId")}>
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Test series">
          <Select {...register("seriesId")}>
            <option value="">—</option>
            {series.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Test type">
          <Select {...register("testKind")}>
            {TEST_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Access">
          <Select {...register("accessLevel")}>
            <option value="FREE">Free</option>
            <option value="PREMIUM">Premium (needs entitlement)</option>
          </Select>
        </Field>
        <Field label="Attempts allowed" hint="0 = unlimited" error={err(formState.errors.maxAttempts)}>
          <Input type="number" min={0} {...register("maxAttempts")} />
        </Field>
        <label className="flex items-center gap-2 self-end text-sm">
          <input type="checkbox" {...register("timed")} /> Timed (uses the duration above; untick for untimed practice)
        </label>
        <Field label="Result release">
          <Select {...register("resultPolicy")}>
            <option value="IMMEDIATE">Immediately after submission</option>
            <option value="AT_TIME">At a fixed time</option>
          </Select>
        </Field>
        <Field label={`Release time (${process.env.NEXT_PUBLIC_EXAM_TIME_ZONE ?? "Asia/Kolkata"})`} error={err(formState.errors.resultReleaseAt)}>
          <Input type="datetime-local" {...register("resultReleaseAt")} />
        </Field>
        <Field label="Description (English)" className="md:col-span-3">
          <Textarea rows={2} {...register("descriptionEn")} />
        </Field>
        <Field label="Description (Hindi)" className="md:col-span-3">
          <Textarea rows={2} lang="hi" {...register("descriptionHi")} />
        </Field>
      </fieldset>
      <div className="md:col-span-2">
        <Button type="submit" disabled={formState.isSubmitting}>
          {examId ? "Save exam" : "Create exam"}
        </Button>
      </div>
    </form>
  );
}

// --- Online catalogue -----------------------------------------------------------------

export function CategoryForm() {
  const { register, handleSubmit, formState, reset } = useForm({ resolver: zodResolver(categorySchema), defaultValues: { position: 0 } });
  const s = useSubmitter("/api/admin/categories", "POST", () => reset());
  return (
    <form onSubmit={handleSubmit((v) => s.submit(v).catch(() => {}))} className="grid grid-cols-2 gap-3 md:grid-cols-4" noValidate>
      {s.error && <div className="col-span-full"><Alert tone="error">{s.error}</Alert></div>}
      <Field label="Slug" error={err(formState.errors.slug)}>
        <Input {...register("slug")} placeholder="ssc-gd" />
      </Field>
      <Field label="Name (English)" error={err(formState.errors.nameEn)}>
        <Input {...register("nameEn")} />
      </Field>
      <Field label="Name (Hindi)">
        <Input lang="hi" {...register("nameHi")} />
      </Field>
      <Field label="Order">
        <Input type="number" {...register("position")} />
      </Field>
      <Field label="Description (English)" className="col-span-full">
        <Textarea rows={2} {...register("descriptionEn")} />
      </Field>
      <div className="col-span-full">
        <Button type="submit" size="sm" disabled={formState.isSubmitting}>
          Add category
        </Button>
      </div>
    </form>
  );
}

export function SeriesForm({ categories }: { categories: Option[] }) {
  const { register, handleSubmit, formState, reset } = useForm({ resolver: zodResolver(seriesSchema), defaultValues: { accessLevel: "FREE", isPublished: true } });
  const s = useSubmitter("/api/admin/series", "POST", () => reset());
  return (
    <form onSubmit={handleSubmit((v) => s.submit(v).catch(() => {}))} className="grid grid-cols-2 gap-3 md:grid-cols-4" noValidate>
      {s.error && <div className="col-span-full"><Alert tone="error">{s.error}</Alert></div>}
      <Field label="Slug" error={err(formState.errors.slug)}>
        <Input {...register("slug")} placeholder="cgl-2027-full-mocks" />
      </Field>
      <Field label="Category" error={err(formState.errors.categoryId)}>
        <Select {...register("categoryId")}>
          <option value="">Select…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Title (English)" error={err(formState.errors.titleEn)}>
        <Input {...register("titleEn")} />
      </Field>
      <Field label="Title (Hindi)">
        <Input lang="hi" {...register("titleHi")} />
      </Field>
      <Field label="Access">
        <Select {...register("accessLevel")}>
          <option value="FREE">Free</option>
          <option value="PREMIUM">Premium</option>
        </Select>
      </Field>
      <label className="flex items-center gap-2 self-end text-sm">
        <input type="checkbox" {...register("isPublished")} /> Published
      </label>
      <div className="col-span-full">
        <Button type="submit" size="sm" disabled={formState.isSubmitting}>
          Add test series
        </Button>
      </div>
    </form>
  );
}

export function EntitlementForm({ exams, series }: { exams: Option[]; series: Option[] }) {
  const { register, handleSubmit, formState, reset } = useForm({ resolver: zodResolver(entitlementSchema), defaultValues: { validDays: 365 } });
  const s = useSubmitter("/api/admin/entitlements", "POST", (_r, v, notify) => {
    reset();
    notify(`Access granted to ${String(v.email)}.`);
  });
  return (
    <form onSubmit={handleSubmit((v) => s.submit(v).catch(() => {}))} className="grid grid-cols-2 gap-3 md:grid-cols-5" noValidate>
      {s.error && <div className="col-span-full"><Alert tone="error">{s.error}</Alert></div>}
      {s.notice && <div className="col-span-full"><Alert tone="success">{s.notice}</Alert></div>}
      <Field label="Student email" error={err(formState.errors.email)}>
        <Input type="email" {...register("email")} />
      </Field>
      <Field label="Premium test" error={err(formState.errors.root)}>
        <Select {...register("examId")}>
          <option value="">—</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="or test series">
        <Select {...register("seriesId")}>
          <option value="">—</option>
          {series.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Valid for (days)" hint="0 = no expiry">
        <Input type="number" min={0} {...register("validDays")} />
      </Field>
      <div className="flex items-end">
        <Button type="submit" size="sm" disabled={formState.isSubmitting}>
          Grant access
        </Button>
      </div>
    </form>
  );
}

export function SectionForm({ examId, subjects }: { examId: string; subjects: string[] }) {
  const { register, handleSubmit, formState, reset } = useForm({
    resolver: zodResolver(sectionSchema),
    defaultValues: { marksCorrect: 2, marksWrong: 0.5 },
  });
  const s = useSubmitter(`/api/exams/${examId}/sections`, "POST", () => reset());
  return (
    <form onSubmit={handleSubmit((v) => s.submit(v).catch(() => {}))} className="grid grid-cols-2 gap-3 md:grid-cols-6" noValidate>
      {s.error && <div className="col-span-full"><Alert tone="error">{s.error}</Alert></div>}
      <Field label="Code" error={err(formState.errors.code)}>
        <Input {...register("code")} placeholder="QA" />
      </Field>
      <Field label="Title (English)" error={err(formState.errors.titleEn)} className="col-span-2 md:col-span-1">
        <Input {...register("titleEn")} />
      </Field>
      <Field label="Title (Hindi)">
        <Input lang="hi" {...register("titleHi")} />
      </Field>
      <Field label="Subject" error={err(formState.errors.subject)}>
        <Input list="subjects" {...register("subject")} />
        <datalist id="subjects">
          {subjects.map((x) => (
            <option key={x} value={x} />
          ))}
        </datalist>
      </Field>
      <Field label="+ marks" error={err(formState.errors.marksCorrect)}>
        <Input type="number" step="0.01" {...register("marksCorrect")} />
      </Field>
      <Field label="− marks (wrong)" error={err(formState.errors.marksWrong)}>
        <Input type="number" step="0.01" {...register("marksWrong")} />
      </Field>
      <Field label="Timer group (optional)" error={err(formState.errors.timerGroup)}>
        <Input {...register("timerGroup")} placeholder="e.g. S1" />
      </Field>
      <Field label="Group minutes" error={err(formState.errors.groupMinutes)}>
        <Input type="number" min={1} {...register("groupMinutes")} placeholder="20" />
      </Field>
      <p className="col-span-full text-xs text-muted">
        Sectional timing: sections with the same timer group share one fixed timer and run one after another in section order. Leave empty for the
        overall exam timer only.
      </p>
      <div className="col-span-full">
        <Button type="submit" size="sm" disabled={formState.isSubmitting}>
          Add section
        </Button>
      </div>
    </form>
  );
}

// --- Question ------------------------------------------------------------------

export function QuestionForm({ questionId, defaults }: { questionId?: string; defaults?: Record<string, unknown> }) {
  const empty = { textEn: "", textHi: "", isCorrect: false };
  const { register, handleSubmit, formState, reset, control, setValue } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: (defaults as never) ?? { difficulty: "MEDIUM", isActive: true, options: [{ ...empty, isCorrect: true }, empty, empty, empty] },
  });
  const options = useFieldArray({ control, name: "options" });
  const values = useWatch({ control, name: "options" });
  const s = useSubmitter(questionId ? `/api/questions/${questionId}` : "/api/questions", questionId ? "PUT" : "POST", (_r, _v, notify) => {
    if (!questionId) reset();
    notify(questionId ? "Saved." : "Question created.");
  });
  return (
    <form onSubmit={handleSubmit((v) => s.submit(v).catch(() => {}))} className="space-y-3" noValidate>
      {s.error && <Alert tone="error">{s.error}</Alert>}
      {s.notice && <Alert tone="success">{s.notice}</Alert>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Field label="Question code" error={err(formState.errors.code)}>
          <Input {...register("code")} placeholder="QA-0101" />
        </Field>
        <Field label="Subject" error={err(formState.errors.subject)}>
          <Input {...register("subject")} placeholder="Quantitative Aptitude" />
        </Field>
        <Field label="Topic">
          <Input {...register("topic")} />
        </Field>
        <Field label="Difficulty">
          <Select {...register("difficulty")}>
            {DIFFICULTIES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Question (English)" error={err(formState.errors.textEn)}>
          <Textarea rows={4} {...register("textEn")} />
        </Field>
        <Field label="Question (Hindi)">
          <Textarea rows={4} lang="hi" {...register("textHi")} />
        </Field>
      </div>
      <Field label="Image URL (optional)" hint="A /path under public/ or an http(s) URL reachable from candidate PCs" error={err(formState.errors.imageUrl)}>
        <Input {...register("imageUrl")} />
      </Field>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Options — select the correct one</legend>
        {err(formState.errors.options) && <p className="text-xs text-danger">{err(formState.errors.options)}</p>}
        {options.fields.map((f, i) => (
          <div key={f.id} className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2">
            <input
              type="radio"
              name="correct"
              aria-label={`Option ${i + 1} is correct`}
              checked={!!values?.[i]?.isCorrect}
              onChange={() => values?.forEach((_, j) => setValue(`options.${j}.isCorrect`, j === i))}
            />
            <Input placeholder={`Option ${String.fromCharCode(65 + i)} (English)`} {...register(`options.${i}.textEn`)} />
            <Input lang="hi" placeholder={`विकल्प ${String.fromCharCode(65 + i)} (हिन्दी)`} {...register(`options.${i}.textHi`)} />
            <Button type="button" variant="ghost" size="sm" onClick={() => options.remove(i)} disabled={options.fields.length <= 2} aria-label="Remove option">
              ✕
            </Button>
          </div>
        ))}
        {options.fields.length < 6 && (
          <Button type="button" variant="secondary" size="sm" onClick={() => options.append(empty)}>
            Add option
          </Button>
        )}
      </fieldset>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Field label="+ marks override" hint="Blank = section rule">
          <Input type="number" step="0.01" {...register("marksCorrect", { setValueAs: (v) => (v === "" || v === null ? null : Number(v)) })} />
        </Field>
        <Field label="− marks override" hint="Blank = section rule">
          <Input type="number" step="0.01" {...register("marksWrong", { setValueAs: (v) => (v === "" || v === null ? null : Number(v)) })} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Explanation (English, shown only after release)">
          <Textarea rows={2} {...register("explanationEn")} />
        </Field>
        <Field label="Explanation (Hindi)">
          <Textarea rows={2} lang="hi" {...register("explanationHi")} />
        </Field>
      </div>
      <Button type="submit" disabled={formState.isSubmitting}>
        {questionId ? "Save question" : "Create question"}
      </Button>
    </form>
  );
}

// --- Candidates / batches / workstations ----------------------------------------------

export function CandidateForm({ batches, centres = [] }: { batches: { id: string; code: string }[]; centres?: { id: string; code: string }[] }) {
  const { register, handleSubmit, formState, reset } = useForm({ resolver: zodResolver(candidateSchema), defaultValues: { preferredLanguage: "en" } });
  const s = useSubmitter("/api/candidates", "POST", (r, v, notify) => {
    reset();
    const gen = (r as { generatedPassword: string | null }).generatedPassword;
    notify(gen ? `Created ${String(v.rollNumber)}. Generated password (shown once): ${gen}` : `Created ${String(v.rollNumber)}.`);
  });
  return (
    <form onSubmit={handleSubmit((v) => s.submit(v).catch(() => {}))} className="grid grid-cols-2 gap-3 md:grid-cols-6" noValidate>
      {s.error && <div className="col-span-full"><Alert tone="error">{s.error}</Alert></div>}
      {s.notice && <div className="col-span-full"><Alert tone="success">{s.notice}</Alert></div>}
      <Field label="Roll number" error={err(formState.errors.rollNumber)}>
        <Input {...register("rollNumber")} />
      </Field>
      <Field label="Full name" error={err(formState.errors.fullName)}>
        <Input {...register("fullName")} />
      </Field>
      <Field label="Password" hint="Blank = generate" error={err(formState.errors.password)}>
        <Input type="text" autoComplete="off" {...register("password")} />
      </Field>
      <Field label="Batch">
        <Select {...register("batchId")}>
          <option value="">—</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.code}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Centre">
        <Select {...register("centreId")}>
          <option value="">—</option>
          {centres.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Language">
        <Select {...register("preferredLanguage")}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
        </Select>
      </Field>
      <div className="col-span-full">
        <Button type="submit" size="sm" disabled={formState.isSubmitting}>
          Add candidate
        </Button>
      </div>
    </form>
  );
}

export function BatchForm() {
  const { register, handleSubmit, formState, reset } = useForm({ resolver: zodResolver(batchSchema) });
  const s = useSubmitter("/api/batches", "POST", () => reset());
  return (
    <form onSubmit={handleSubmit((v) => s.submit(v).catch(() => {}))} className="flex flex-wrap items-end gap-2" noValidate>
      {s.error && <Alert tone="error">{s.error}</Alert>}
      <Field label="Batch code" error={err(formState.errors.code)}>
        <Input {...register("code")} />
      </Field>
      <Field label="Name" error={err(formState.errors.name)}>
        <Input {...register("name")} />
      </Field>
      <Button type="submit" size="sm" disabled={formState.isSubmitting}>
        Add batch
      </Button>
    </form>
  );
}

export function WorkstationForm({ centres = [] }: { centres?: { id: string; code: string }[] }) {
  const { register, handleSubmit, formState, reset } = useForm({ resolver: zodResolver(workstationSchema) });
  const s = useSubmitter("/api/workstations", "POST", () => reset());
  return (
    <form onSubmit={handleSubmit((v) => s.submit(v).catch(() => {}))} className="flex flex-wrap items-end gap-2" noValidate>
      {s.error && <Alert tone="error">{s.error}</Alert>}
      <Field label="Code" error={err(formState.errors.code)}>
        <Input {...register("code")} placeholder="LAB1-PC01" />
      </Field>
      <Field label="Centre">
        <Select {...register("centreId")}>
          <option value="">—</option>
          {centres.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Lab">
        <Input {...register("lab")} />
      </Field>
      <Field label="Label">
        <Input {...register("label")} />
      </Field>
      <Button type="submit" size="sm" disabled={formState.isSubmitting}>
        Add workstation
      </Button>
    </form>
  );
}

export function CentreForm() {
  const { register, handleSubmit, formState, reset } = useForm({ resolver: zodResolver(centreSchema) });
  const s = useSubmitter("/api/centres", "POST", () => reset());
  return (
    <form onSubmit={handleSubmit((v) => s.submit(v).catch(() => {}))} className="grid grid-cols-2 gap-3 md:grid-cols-4" noValidate>
      {s.error && (
        <div className="col-span-full">
          <Alert tone="error">{s.error}</Alert>
        </div>
      )}
      <Field label="Centre code" error={err(formState.errors.code)}>
        <Input {...register("code")} placeholder="DEL-01" />
      </Field>
      <Field label="Name" error={err(formState.errors.name)}>
        <Input {...register("name")} />
      </Field>
      <Field label="City">
        <Input {...register("city")} />
      </Field>
      <Field label="Address">
        <Input {...register("address")} />
      </Field>
      <div className="col-span-full">
        <Button type="submit" size="sm" disabled={formState.isSubmitting}>
          Add centre
        </Button>
      </div>
    </form>
  );
}

// --- Schedule ---------------------------------------------------------------------

export function ScheduleForm({
  exams,
  batches,
  scheduleId,
  defaults,
  timeZone,
}: {
  exams: { id: string; code: string; titleEn: string; status: string; defaultDurationMinutes: number }[];
  batches: { id: string; code: string }[];
  scheduleId?: string;
  defaults?: Record<string, unknown>;
  timeZone: string;
}) {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: (defaults as never) ?? {
      timeZone,
      durationMinutes: 60,
      lateEntryMinutes: 15,
      allowPause: true,
      enforceWorkstation: false,
      requirePhoto: true,
      cameraMonitoring: true,
      requireFullscreen: true,
      violationLimit: 3,
      autoSubmitOnViolations: true,
    },
  });
  const s = useSubmitter(scheduleId ? `/api/schedules/${scheduleId}` : "/api/schedules", scheduleId ? "PUT" : "POST", (r, _v, notify) => {
    if (!scheduleId) router.push(`/admin/schedules/${(r as { id: string }).id}`);
    else notify("Saved.");
  });
  return (
    <form onSubmit={handleSubmit((v) => s.submit(v).catch(() => {}))} className="grid grid-cols-1 gap-3 md:grid-cols-3" noValidate>
      {s.error && <div className="md:col-span-3"><Alert tone="error">{s.error}</Alert></div>}
      {s.notice && <div className="md:col-span-3"><Alert tone="success">{s.notice}</Alert></div>}
      <Field label="Exam" error={err(formState.errors.examId)}>
        <Select {...register("examId")}>
          <option value="">Select…</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id} disabled={e.status === "ARCHIVED"}>
              {e.code} — {e.titleEn} {e.status !== "READY" ? `(${e.status})` : ""}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Title" error={err(formState.errors.title)}>
        <Input {...register("title")} placeholder="Morning sitting, Lab 1" />
      </Field>
      <Field label="Batch (optional)">
        <Select {...register("batchId")}>
          <option value="">—</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.code}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={`Login opens (${timeZone})`} error={err(formState.errors.loginOpensAt)}>
        <Input type="datetime-local" {...register("loginOpensAt")} />
      </Field>
      <Field label={`Scheduled start (${timeZone})`} error={err(formState.errors.startAt)}>
        <Input type="datetime-local" {...register("startAt")} />
      </Field>
      <Field label="Time zone" error={err(formState.errors.timeZone)}>
        <Input {...register("timeZone")} />
      </Field>
      <Field label="Duration (minutes)" error={err(formState.errors.durationMinutes)}>
        <Input type="number" min={1} {...register("durationMinutes")} />
      </Field>
      <Field label="Late entry window (minutes after start)" error={err(formState.errors.lateEntryMinutes)}>
        <Input type="number" min={0} {...register("lateEntryMinutes")} />
      </Field>
      <div className="flex flex-col justify-end gap-1 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("allowPause")} /> Allow emergency hold
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("enforceWorkstation")} /> Require assigned workstation
        </label>
      </div>
      <fieldset className="grid grid-cols-1 gap-2 rounded-md border border-border p-3 text-sm md:col-span-3 md:grid-cols-3">
        <legend className="px-1 font-semibold">Proctoring</legend>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("requirePhoto")} /> Photo before login (Cloudinary)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("cameraMonitoring")} /> Camera on during exam + start/end photos
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("requireFullscreen")} /> Require fullscreen
        </label>
        <Field label="Violation limit (0 = no limit)" hint="Fullscreen exits, tab switches, camera loss" error={err(formState.errors.violationLimit)}>
          <Input type="number" min={0} max={50} {...register("violationLimit")} />
        </Field>
        <label className="flex items-center gap-2 self-end">
          <input type="checkbox" {...register("autoSubmitOnViolations")} /> Auto-submit when the limit is reached
        </label>
        <p className="text-xs text-muted md:col-span-3">
          The invigilator is alerted on Live Monitoring when a candidate reaches the limit. A browser cannot block Alt+Tab; use the Windows kiosk
          client at centres for that.
        </p>
      </fieldset>
      <div className="md:col-span-3">
        <Button type="submit" disabled={formState.isSubmitting}>
          {scheduleId ? "Save schedule" : "Create schedule"}
        </Button>
        <p className="mt-2 text-xs text-muted">
          The server starts the exam automatically at the scheduled start and ends it at start + duration. No one needs to press Start.
        </p>
      </div>
    </form>
  );
}

// --- Users ----------------------------------------------------------------------

export function UserForm() {
  const { register, handleSubmit, formState, reset } = useForm({ resolver: zodResolver(createUserSchema), defaultValues: { roleCode: "INVIGILATOR" } });
  const s = useSubmitter("/api/admin/users", "POST", () => reset());
  return (
    <form onSubmit={handleSubmit((v) => s.submit(v).catch(() => {}))} className="grid grid-cols-2 gap-3 md:grid-cols-5" noValidate>
      {s.error && <div className="col-span-full"><Alert tone="error">{s.error}</Alert></div>}
      <Field label="Username" error={err(formState.errors.username)}>
        <Input autoComplete="off" {...register("username")} />
      </Field>
      <Field label="Full name" error={err(formState.errors.fullName)}>
        <Input {...register("fullName")} />
      </Field>
      <Field label="Password" error={err(formState.errors.password)}>
        <Input type="password" autoComplete="new-password" {...register("password")} />
      </Field>
      <Field label="Role">
        <Select {...register("roleCode")}>
          {ROLE_CODES.map((r) => (
            <option key={r} value={r}>
              {ROLES[r].name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex items-end">
        <Button type="submit" size="sm" disabled={formState.isSubmitting}>
          Add user
        </Button>
      </div>
    </form>
  );
}
