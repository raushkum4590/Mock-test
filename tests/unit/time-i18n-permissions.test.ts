import { describe, expect, it } from "vitest";
import { formatDuration, timeZoneOffsetMs, utcToZonedInput, zonedTimeToUtc } from "@/lib/time/zone";
import { pickText, t } from "@/lib/i18n/dictionary";
import { hasPermission, PERMISSIONS, ROLES } from "@/lib/permissions";

describe("time zones", () => {
  it("converts IST wall-clock to UTC and back", () => {
    const utc = zonedTimeToUtc("2026-10-10T10:00", "Asia/Kolkata");
    expect(utc.toISOString()).toBe("2026-10-10T04:30:00.000Z");
    expect(utcToZonedInput(utc, "Asia/Kolkata")).toBe("2026-10-10T10:00");
    expect(timeZoneOffsetMs(utc, "Asia/Kolkata")).toBe(5.5 * 3600 * 1000);
  });

  it("handles DST zones correctly", () => {
    expect(zonedTimeToUtc("2026-07-01T09:00", "Europe/London").toISOString()).toBe("2026-07-01T08:00:00.000Z");
    expect(zonedTimeToUtc("2026-01-15T09:00", "Europe/London").toISOString()).toBe("2026-01-15T09:00:00.000Z");
  });

  it("rejects malformed input and formats durations", () => {
    expect(() => zonedTimeToUtc("10/10/2026 10:00", "Asia/Kolkata")).toThrow();
    expect(formatDuration(3725)).toBe("01:02:05");
    expect(formatDuration(-5)).toBe("00:00:00");
  });
});

describe("bilingual text", () => {
  it("returns the requested language and falls back when a translation is missing", () => {
    expect(pickText("hi", "Capital?", "राजधानी?")).toEqual({ text: "राजधानी?", fallback: false });
    expect(pickText("en", "Capital?", "राजधानी?")).toEqual({ text: "Capital?", fallback: false });
    expect(pickText("hi", "Synonym of ABUNDANT", null)).toEqual({ text: "Synonym of ABUNDANT", fallback: true });
    expect(pickText("en", null, "केवल हिंदी")).toEqual({ text: "केवल हिंदी", fallback: true });
  });

  it("has Hindi UI strings", () => {
    expect(t("hi", "saveAndNext")).toBe("सहेजें और आगे बढ़ें");
    expect(t("en", "saveAndNext")).toBe("Save & Next");
  });
});

describe("role permissions", () => {
  it("super admin has every permission; others are least-privilege", () => {
    for (const p of PERMISSIONS) expect(hasPermission("SUPER_ADMIN", p)).toBe(true);
    expect(hasPermission("INVIGILATOR", "schedules.hold")).toBe(true);
    expect(hasPermission("INVIGILATOR", "results.view")).toBe(false);
    expect(hasPermission("RESULT_VIEWER", "schedules.publish")).toBe(false);
    expect(hasPermission("EXAM_ADMIN", "users.manage")).toBe(false);
    expect(hasPermission("EXAM_ADMIN", "backup.manage")).toBe(false);
    expect(hasPermission("NOT_A_ROLE", "results.view")).toBe(false);
    expect(Object.keys(ROLES)).toHaveLength(5);
    expect(hasPermission("CONTENT_MANAGER", "questions.manage")).toBe(true);
    expect(hasPermission("CONTENT_MANAGER", "students.manage")).toBe(false);
    expect(hasPermission("CONTENT_MANAGER", "schedules.publish")).toBe(false);
  });
});
