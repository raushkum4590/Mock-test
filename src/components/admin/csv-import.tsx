"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api } from "@/lib/client/api";
import { Alert, Button } from "@/components/ui";

type Report = {
  created: number;
  errors: { row: number; message: string }[];
  credentials?: { rollNumber: string; fullName: string; password: string }[];
};

export function CsvImport({ url, columns, label }: { url: string; columns: string; label: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const upload = async () => {
    const file = input.current?.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    setReport(null);
    try {
      const r = await api<Report>(url, { raw: await file.text() });
      setReport(r);
      if (r.created) router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const downloadCredentials = () => {
    if (!report?.credentials?.length) return;
    const text = "roll_number,full_name,password\r\n" + report.credentials.map((c) => `${c.rollNumber},"${c.fullName}",${c.password}`).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
    a.download = "generated-passwords.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-2 text-sm">
      <p className="text-muted">
        {label}. Columns: <code className="text-xs">{columns}</code>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input ref={input} type="file" accept=".csv,text/csv" className="text-sm" />
        <Button size="sm" onClick={upload} disabled={busy}>
          {busy ? "Importing…" : "Import CSV"}
        </Button>
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      {report && report.errors.length === 0 && (
        <Alert tone="success">
          Imported {report.created} record(s).
          {!!report.credentials?.length && (
            <>
              {" "}
              {report.credentials.length} password(s) were generated —{" "}
              <button type="button" className="underline" onClick={downloadCredentials}>
                download them now
              </button>{" "}
              (shown only once).
            </>
          )}
        </Alert>
      )}
      {report && report.errors.length > 0 && (
        <Alert tone="error">
          Nothing was imported. Fix these problems and upload again:
          <ul className="mt-1 list-disc pl-5">
            {report.errors.slice(0, 50).map((e, i) => (
              <li key={i}>
                {e.row ? `Row ${e.row}: ` : ""}
                {e.message}
              </li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  );
}
