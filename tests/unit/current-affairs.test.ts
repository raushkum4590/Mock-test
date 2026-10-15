import { describe, expect, it } from "vitest";
import { countriesIn } from "@/lib/current-affairs/countries";
import { fixedDayDate } from "@/lib/current-affairs/days";
import {
  extractAgreement,
  extractAppointment,
  extractAward,
  extractDay,
  extractExercise,
  extractMonth,
  extractSportsWin,
  extractSummit,
  normaliseTitle,
  personName,
  type RawItem,
} from "@/lib/current-affairs/extract";
import { buildPools, buildQuiz } from "@/lib/current-affairs/quiz";

describe("title normalisation", () => {
  it("title-cases ALL CAPS headlines but keeps acronyms and ordinals", () => {
    expect(normaliseTitle("LOK SABHA SPEAKER TO LEAD DELEGATION AT THE 68TH COMMONWEALTH PARLIAMENTARY CONFERENCE (CPC) IN BRIDGETOWN")).toBe(
      "Lok Sabha Speaker to Lead Delegation at the 68th Commonwealth Parliamentary Conference (CPC) in Bridgetown",
    );
    expect(normaliseTitle("Normal headline stays as it is")).toBe("Normal headline stays as it is");
  });
});

describe("fact extractors (real headlines)", () => {
  it("appointments", () => {
    expect(extractAppointment("Lt Gen Virendra Vats Takes Over as Director General of National Cadet Corps")).toEqual({
      who: "Lt Gen Virendra Vats",
      post: "Director General of National Cadet Corps",
      verb: "charge",
    });
    expect(extractAppointment(normaliseTitle("SHRI DIVAKAR JAYANT, INAS, TAKES OVER AS DIRECTOR GENERAL OF NAVAL ARMAMENT"))?.who).toBe("Divakar Jayant");
    expect(extractAppointment("Prime Minister congratulates Shri Hagrama Mohilary on being sworn in as Chief Executive Member of Bodoland Territorial Council")?.who).toBe(
      "Hagrama Mohilary",
    );
    expect(extractAppointment("ECI appointed Observers closely monitoring election process in Bihar")).toBeNull();
    expect(extractAppointment("CEC holds meeting with newly appointed observers")).toBeNull();
  });

  it("person names reject non-names", () => {
    expect(personName("BJP MLA- Yumnam Khemchand Singh")).toBe("Yumnam Khemchand Singh");
    expect(personName("Chief coach Sjoerd Marijne")).toBe("");
    expect(personName("Tackling of Proxy Representation of")).toBe("");
  });

  it("defence exercises", () => {
    expect(extractExercise("India-Australia Joint Military Exercise ‘AUSTRAHIND 2025’ to Begin in Perth 13 october")).toEqual({
      name: "AUSTRAHIND",
      partners: ["Australia"],
      venue: "Perth",
    });
    expect(extractExercise(normaliseTitle("JAPAN-INDIA MARITIME EXERCISE (JAIMEX) – 2025"))?.name).toBe("JAIMEX");
    expect(extractExercise("Tri-Service Exercise Trishul Underway Along Western Border With Pakistan")).toMatchObject({ name: "Trishul", partners: [] });
    expect(extractExercise("Home Minister Urges Non-Interference in Special Intensive Revision Exercise")).toBeNull();
  });

  it("awards, days, summits, agreements, sports", () => {
    expect(extractAward("Maria Corina Machado Wins 2025 Nobel Peace Prize for Championing Democracy in Venezuela")).toEqual({
      award: "2025 Nobel Peace Prize",
      winner: "Maria Corina Machado",
    });
    expect(extractAward("IndiaAI Launches Face Authentication Challenge with ₹2.5 Crore Prize Pool")).toBeNull();
    expect(extractDay("MoHUA observes World Habitat Day 2025 on the theme ‘Urban Solutions to Crisis’")).toEqual({ day: "World Habitat Day", theme: "Urban Solutions to Crisis" });
    expect(extractDay("World Observes International Day of Older Persons")?.day).toBe("International Day of Older Persons");
    expect(extractSummit("India to attend 20th East Asia Summit in Kuala Lumpur")).toEqual({ event: "20th East Asia Summit", venue: "Kuala Lumpur" });
    expect(extractSummit("Department of Telecommunications (DoT) and International Telecommunication Union (ITU) Host ‘AI for Good Summit’ at India Mobile Congress")).toBeNull();
    expect(extractAgreement("India and Mongolia sign MoUs on Heritage, Minerals and Digital Solutions")).toEqual({ country: "Mongolia", area: "Heritage, Minerals and Digital Solutions" });
    expect(extractAgreement("Prime Minister welcomes the agreement on first phase of President Trump’s peace plan")).toBeNull();
    expect(extractSportsWin("Mirabai Chanu Wins Silver in Women’s 48kg Category at World Championships in Norway")).toMatchObject({ who: "Mirabai Chanu", feat: "Silver" });
    expect(extractSportsWin("India Edge Past Argentina 10–9 to Lift KogniVera International Polo Cup")).toBeNull();
  });

  it("countries and fixed day dates", () => {
    expect(countriesIn("Indian Navy hosts exercise with Indonesian Navy and the Republic of Korea")).toEqual(["Indonesia", "South Korea"]);
    expect(fixedDayDate("World Food Day 2025")).toBe("16 October");
    expect(fixedDayDate("World Teachers’ Day")).toBe("5 October");
    expect(fixedDayDate("World Habitat Day")).toBeNull();
  });
});

describe("month extraction and quiz", () => {
  const item = (title: string, date: string, source: RawItem["source"] = "AIR"): RawItem => ({ source, title, date, url: `https://example.gov.in/${encodeURIComponent(title)}` });
  const raw: RawItem[] = [
    item("AI Impact Summit 2026 roadshow held in Dubai", "2026-02-01"),
    item("Leaders arrive for AI Impact Summit 2026 in New Delhi", "2026-02-18"),
    item("AI Impact Summit 2026 in New Delhi adopts declaration", "2026-02-20"),
    item("World Food Day 2025", "2026-02-17", "PIB"),
    item("Ministry celebrates World Food Day 2025", "2026-02-17", "PIB"),
    item("RBI imposes monetary penalty on The Example Co-operative Bank Ltd., Gujarat", "2026-02-05", "RBI"),
    item("Weather: IMD forecasts heavy rainfall", "2026-02-06"),
  ];

  it("uses the venue most reports name and the fixed date of a day", () => {
    const f = extractMonth(raw);
    expect(f.summits).toHaveLength(1);
    expect(f.summits[0]!.venue).toBe("New Delhi");
    expect(f.days).toHaveLength(1);
    expect(f.days[0]!.observed).toBe("16 October");
    expect(f.rbiPenalties.map((p) => p.text)).toEqual(["The Example Co-operative Bank Ltd., Gujarat"]);
  });

  it("builds deterministic 4-option questions with the answer among the options", () => {
    const f = extractMonth([
      item("Lt Gen Virendra Vats Takes Over as Director General of National Cadet Corps", "2025-10-01"),
      item("Shirish Chandra Murmu takes over as RBI Deputy Governor", "2025-10-09"),
      item("Rajesh Agrawal assumes charge as Secretary, Department of Commerce", "2025-10-01"),
      item("Shobha Gupta Assumes Charge as Director General of Defence Estates", "2025-10-01"),
    ]);
    const pools = buildPools([f]);
    const a = buildQuiz("2025-10", f, pools);
    expect(a.length).toBe(4);
    for (const q of a) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
    }
    const q = a.find((x) => x.q.includes("National Cadet Corps"))!;
    expect(q.options[q.answer]).toBe("Lt Gen Virendra Vats");
    expect(buildQuiz("2025-10", f, pools)).toEqual(a);
  });
});
