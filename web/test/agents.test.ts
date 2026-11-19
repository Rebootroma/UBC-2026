import { describe, expect, it } from "vitest";
import { buildFacts } from "@/lib/agents/facts";
import { deterministicReport, groundReport, ReportSchema } from "@/lib/agents/run";
import { validateObservation } from "@/lib/settlement";
import { OBS_BY_ID } from "@/lib/data";

const T = Date.parse("2024-07-08T12:00:00Z") / 1000;

describe("agent grounding", () => {
  it("every agent gets facts with unique ids and provenance", () => {
    for (const a of ["intel", "exposure", "coverage", "integrity"] as const) {
      const f = buildFacts(a, T, "RSL-0001");
      expect(f.length).toBeGreaterThan(0);
      expect(new Set(f.map((x) => x.id)).size).toBe(f.length);
    }
  });
  it("integrity agent sees the KPSX outage", () => {
    expect(buildFacts("integrity", T).some((f) => f.id === "silent-KPSX")).toBe(true);
  });
  it("drops findings that cite facts that don't exist", () => {
    const facts = buildFacts("coverage", T, "RSL-0001");
    const report = {
      headline: "x",
      findings: [
        { text: "grounded", evidence: [facts[0].id] },
        { text: "invented payout of $1M", evidence: ["made-up-fact"] },
      ],
      uncertainty: "",
      recommendedActions: [],
    };
    const { report: r, dropped } = groundReport(report, facts);
    expect(dropped).toBe(1);
    expect(r.findings.map((f) => f.text)).toEqual(["grounded"]);
  });
  it("schema rejects malformed model output", () => {
    expect(ReportSchema.safeParse({ headline: "x", findings: [], uncertainty: "", recommendedActions: [] }).success).toBe(false);
    expect(ReportSchema.safeParse({ headline: "x", findings: [{ text: "y", evidence: [] }], uncertainty: "", recommendedActions: [] }).success).toBe(false);
  });
  it("deterministic fallback only restates facts", () => {
    const facts = buildFacts("intel", T);
    const r = deterministicReport("intel", facts);
    expect(ReportSchema.safeParse(r).success).toBe(true);
    expect(groundReport(r, facts).dropped).toBe(0);
  });
});

describe("settlement validation (layer 1)", () => {
  it("passes a genuine observation", () => {
    const checks = validateObservation(OBS_BY_ID.get("KPSX-1720425060"));
    expect(checks.every((c) => c.passed)).toBe(true);
  });
  it("rejects unknown and tampered observations", () => {
    expect(validateObservation(undefined)[0].passed).toBe(false);
    const o = OBS_BY_ID.get("KPSX-1720425060")!;
    const tampered = validateObservation({ ...o, sustainedKt: 90 });
    expect(tampered.find((c) => c.check === "Independent METAR parse")!.passed).toBe(false);
    const rehashed = validateObservation({ ...o, metar: o.metar.replace("47G70", "90G99") });
    expect(rehashed.find((c) => c.check === "Source hash")!.passed).toBe(false);
  });
});
