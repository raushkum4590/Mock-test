"use client";

import { useRouter } from "next/navigation";
import { ActionButton } from "./action-button";

/** Creates a draft test from a library pattern, then opens it to add questions. */
export function CreateFromPatternButton({ patternId }: { patternId: string }) {
  const router = useRouter();
  return (
    <ActionButton
      url="/api/exams/from-pattern"
      body={{ patternId }}
      variant="primary"
      onDone={(r) => router.push(`/admin/exams/${(r as { id: string }).id}`)}
    >
      Create mock test
    </ActionButton>
  );
}
