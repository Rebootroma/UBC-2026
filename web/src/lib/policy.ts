import type { Business, Eligibility, Observation, PolicyStatus } from "./types";

/**
 * Off-chain mirror of ParametricReserve.checkEligibility. It is used to decide which policies to submit
 * and to explain outcomes. The contract re-checks everything; if the two ever disagree, the contract wins.
 */
export interface EligibilityInput {
  policy: Business["policy"];
  status: PolicyStatus; // on-chain status (or "Active" before chain sync)
  settledEvents: Set<string>; // eventIds this policy has already settled
  observation: Observation | undefined;
  eventId: string;
}

export interface EligibilityDecision {
  result: Eligibility;
  explanation: string;
}

export function evaluatePolicy(input: EligibilityInput): EligibilityDecision {
  const { policy, status, settledEvents, observation: o, eventId } = input;
  if (!o || !o.verifiable || o.sustainedKt === null) {
    return { result: "UnknownObservation", explanation: "No verified observation was provided, so nothing can be evaluated." };
  }
  if (settledEvents.has(eventId)) {
    return { result: "AlreadySettledForEvent", explanation: `Policy ${policy.policyNumber} has already been settled for this storm. Each policy pays at most once per event.` };
  }
  if (status !== "Active") {
    return { result: "PolicyNotActive", explanation: `Policy ${policy.policyNumber} is ${status}, not Active.` };
  }
  if (!policy.stations.includes(o.stationId)) {
    return { result: "StationNotApproved", explanation: `${o.stationId} is not an approved station for ${policy.policyNumber} (approved: ${policy.stations.join(", ")}).` };
  }
  const start = Date.parse(policy.coverageStart) / 1000;
  const end = Date.parse(policy.coverageEnd) / 1000;
  if (o.t < start || o.t > end) {
    return { result: "OutsideCoverageWindow", explanation: `Observation time ${o.time} is outside the coverage window ${policy.coverageStart} – ${policy.coverageEnd}.` };
  }
  if (o.sustainedKt < policy.thresholdKt) {
    return { result: "BelowThreshold", explanation: `${o.stationId} reported ${o.sustainedKt} kt sustained, below the ${policy.thresholdKt} kt trigger.` };
  }
  return {
    result: "Eligible",
    explanation: `${o.stationId} reported ${o.sustainedKt} kt sustained wind at ${o.time.slice(11, 16)} UTC, meeting the ${policy.thresholdKt} kt trigger at an approved station inside the coverage window.`,
  };
}

/** Policies whose trigger is satisfied by this observation (ignoring on-chain status). */
export function triggeredBy(businesses: Business[], o: Observation): Business[] {
  if (!o.verifiable || o.sustainedKt === null) return [];
  return businesses.filter((b) => {
    const s = Date.parse(b.policy.coverageStart) / 1000;
    const e = Date.parse(b.policy.coverageEnd) / 1000;
    return b.policy.stations.includes(o.stationId) && o.t >= s && o.t <= e && o.sustainedKt! >= b.policy.thresholdKt;
  });
}
