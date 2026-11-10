import { INTERESTS, SCHOOLS } from "./seed";
import type { Opportunity, Profile } from "./types";

export function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, dLat = ((b.lat - a.lat) * Math.PI) / 180, dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
}

export const ageOfProfile = (p?: Profile) => (p?.birthYear ? new Date().getFullYear() - p.birthYear : 30);

export interface Eligibility { ok: boolean; checks: { label: string; ok: boolean; detail: string }[] }

export function eligibility(p: Profile, o: Opportunity): Eligibility {
  const age = ageOfProfile(p);
  const ageOk = age >= o.minAge && (!o.maxAge || age <= o.maxAge);
  const checks = [
    { label: "Age", ok: ageOk, detail: `You're ${age}; this is for ${o.minAge}${o.maxAge ? `–${o.maxAge}` : "+"}` },
    { label: "Location", ok: true, detail: `${o.emirate ?? "UAE"} · reachable from your school` },
    { label: "Team", ok: true, detail: o.teamSize ?? "Individual" },
    { label: "Guardian approval", ok: true, detail: o.needsConsent && age < 15 ? "Needed — Sawa sends the request for you" : "Not needed" },
  ];
  return { ok: ageOk, checks };
}

export interface Match { o: Opportunity; score: number; reasons: string[]; distance: number; overlap: string[] }

/**
 * Transparent, rule-based matching (no black box): interest overlap, age fit, distance,
 * same school and upcoming deadline. Reasons are shown to the student.
 */
export function matchOpportunity(p: Profile, o: Opportunity): Match {
  const home = SCHOOLS.find((s) => s.id === p.schoolId) ?? SCHOOLS[0];
  const venue = SCHOOLS.find((s) => s.id === o.schoolId) ?? home;
  const distance = km(home, venue);
  const overlap = o.interests.filter((i) => p.interests.includes(i));
  const age = ageOfProfile(p);
  const ageOk = age >= o.minAge && (!o.maxAge || age <= o.maxAge);
  const days = (new Date(o.startsAt).getTime() - Date.now()) / 86_400_000;
  let score = 28;
  score += Math.min(overlap.length, 2) * 20;
  score += Math.round((overlap.length / Math.max(1, o.interests.length)) * 12);
  score += distance <= 2 ? 10 : distance <= 8 ? 7 : distance <= 15 ? 4 : 1;
  if (o.schoolId === p.schoolId) score += 4;
  if (days >= 0 && days <= 14) score += 3;
  if (!ageOk) score -= 40;
  score = Math.max(5, Math.min(98, score));
  const name = (id: string) => INTERESTS.find((i) => i.id === id)?.en ?? id;
  const reasons: string[] = [];
  if (overlap.length) reasons.push(`You picked ${overlap.map(name).join(" & ")}`);
  if (ageOk) reasons.push(`Open to age ${age}`);
  else reasons.push(`For ages ${o.minAge}${o.maxAge ? `–${o.maxAge}` : "+"}`);
  reasons.push(o.schoolId === p.schoolId ? "At your school" : `${distance} km from your school`);
  return { o, score, reasons, distance, overlap };
}

export function rankOpportunities(p: Profile, list: Opportunity[]) {
  return list.map((o) => matchOpportunity(p, o)).sort((a, b) => b.score - a.score);
}

export const TYPE_LABEL: Record<string, string> = {
  competition: "Competition", hackathon: "Hackathon", workshop: "Workshop", club: "Club", mun: "MUN",
  volunteering: "Volunteering", leadership: "Leadership", event: "Event",
};
