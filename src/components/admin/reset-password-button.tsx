"use client";

import { useState } from "react";
import { ActionButton } from "./action-button";

export function ResetPasswordButton({ candidateId, rollNumber }: { candidateId: string; rollNumber: string }) {
  const [password, setPassword] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col">
      <ActionButton
        url={`/api/candidates/${candidateId}`}
        method="PATCH"
        body={{ resetPassword: true }}
        confirm={`Reset the password for ${rollNumber}? Their current session will end.`}
        onDone={(r) => setPassword((r as { generatedPassword?: string }).generatedPassword ?? null)}
      >
        Reset password
      </ActionButton>
      {password && (
        <span className="mt-1 text-xs">
          New password (shown once): <code className="font-mono font-semibold">{password}</code>
        </span>
      )}
    </span>
  );
}
