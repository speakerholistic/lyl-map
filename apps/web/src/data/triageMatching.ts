/**
 * Free-text routing for the Triage Wizard.
 * Q1, Q2 and Q3 are typed answers; these helpers map the typed text onto the
 * existing track / module / addressee data in triageData.ts via keyword matching.
 */

import { Q1_TRACKS, Q2_OPTIONS, type Q1Track, type Q3Addressee } from './triageData';

// Keywords are regex sources matched from a word start, case-insensitive.
const TRACK_KEYWORDS: Record<string, string[]> = {
  A: ['discharg', 'evict', 'notice', 'kick(ed)? out', 'have to leave', 'leave', 'transfer', 'mov(e|ed|ing)', '30[- ]day'],
  B: ['fall', 'fell', 'injur', 'hurt', 'bruis', 'wound', 'bed ?sore', 'pressure (sore|ulcer|injur)', 'skin tear', 'broken', 'fractur', 'accident', 'safety'],
  C: ['medic', 'meds\\b', 'drug', 'sedat', 'restrain', 'anti-?psychotic', 'dose', 'pills?\\b', 'prescri', 'bed ?rails?', 'straps?\\b'],
  D: ['neglect', 'hygien', 'food', 'water', 'dehydrat', 'hungry', 'weight', 'eat', 'fed\\b', 'feed', 'incontinen', 'diaper', 'utis?\\b', 'urin', 'soiled', 'bath', 'dirty', 'meal'],
  E: ['bill', 'charg', 'fees?\\b', 'contract', 'money', 'cost', 'invoice', 'pay', 'financ', 'assets?\\b', 'bank', 'stole', 'steal', 'exploit'],
  F: ['report', 'document', 'incident', 'complain', 'rights?\\b', 'privacy', 'dignity', 'abus', 'pattern', 'again', 'keeps happening'],
  G: ['plan', 'future', 'not in crisis', 'prepar', 'therap', 'rehab', 'wheelchair', 'walker', 'accessib', 'ramps?\\b', 'wander', 'hoard'],
};

const MODULE_KEYWORDS: Record<string, string[]> = {
  'MOD-07': ['evict', 'discharge notice', 'notice', 'kick(ed)? out', 'have to leave', 'fight', 'buy time', 'appeal'],
  'MOD-24': ['transfer', 'mov(e|ed|ing)', 'transition', 'different setting', 'relocat'],
  'MOD-18': ['fell', 'a fall', 'fall (already )?happened', 'investigat'],
  'MOD-05': ['fall risk', 'falling', 'might fall', 'unsteady', 'balance'],
  'MOD-04': ['bed ?sores?', 'pressure (sore|ulcer|injur|wound)', 'ulcer'],
  'MOD-17': ['skin tear', 'bruis', 'rough', 'grabb'],
  'MOD-09': ['infect', 'not healing', 'wound', 'pus\\b'],
  'MOD-03': ['sedat', 'drugged', 'anti-?psychotic', 'drowsy', 'over-?medicat', 'consent'],
  'MOD-06': ['dose', 'missed', 'wrong med', 'mix-?up', 'medication error', 'pills?\\b', 'prescri'],
  'MOD-15': ['restrain', 'bed ?rails?', 'belts?\\b', 'straps?\\b', 'tied'],
  'MOD-08': ['dehydrat', 'water', 'thirst', 'fluids?\\b', 'drink'],
  'MOD-11': ['weight', 'food', 'fed\\b', 'feed', 'eat', 'meals?\\b', 'nutrition', 'hungry'],
  'MOD-14': ['incontinen', 'utis?\\b', 'urin', 'diaper', 'soiled', 'toilet', 'bladder'],
  'MOD-10': ['charg', 'bill', 'invoice', 'overcharg', 'statement'],
  'MOD-16': ['hidden', 'fees?\\b', 'contract', 'terms', 'admission agreement'],
  'MOD-21': ['stole', 'steal', 'taken', 'exploit', 'pressur', 'assets?\\b', 'bank', 'power of attorney'],
  'MOD-13': ['incident report', 'report', 'file\\b', 'filing'],
  'MOD-22': ['rights?\\b', 'privacy', 'dignity', 'respect', 'humiliat', 'visit'],
  'MOD-23': ['pattern', 'keeps happening', 'again', 'repeat', 'every time', 'multiple'],
  'MOD-01': ['hoard', 'clutter', 'unsafe (home|condition)', 'conditions'],
  'MOD-02': ['wheelchair', 'walker', 'cane\\b', 'mobility', 'equipment'],
  'MOD-12': ['ramps?\\b', 'doors?\\b', 'bathroom', 'accessib', 'ada\\b', 'grab bars?'],
  'MOD-19': ['therap', 'rehab', 'occupational'],
  'MOD-20': ['wander', 'elope', 'unsupervised', 'door alarm', 'got out', 'escap'],
};

const ADDRESSEE_KEYWORDS: Record<Q3Addressee, string[]> = {
  Administrator: ['admin', 'manag', 'executive director', 'owner', 'operator'],
  'Business Office / Billing': ['bill', 'business office', 'accounts?\\b', 'financ', 'bookkeep'],
  'Social Services Director': ['social', 'case manager', 'discharge planner'],
  'Medical Director': ['doctor', 'physician', 'medical director', 'md\\b', 'dr\\b'],
  'Director of Nursing': ['nurs', 'don\\b'],
  'State Licensing Agency / Ombudsman': ['state', 'licens', 'ombuds', 'inspector', 'advocate', 'regulat', 'department of health'],
  'Medicare Advantage Plan / QIO': ['medicare', 'medicaid', 'insur', 'qio', 'health plan'],
};

const DEFAULT_TRACK_ID = 'F';
const DEFAULT_ADDRESSEE: Q3Addressee = 'Administrator';

function score(text: string, keywords: string[]): number {
  return keywords.filter((kw) => new RegExp(`\\b${kw}`, 'i').test(text)).length;
}

function bestKey<K extends string>(text: string, table: Record<K, string[]>): K | null {
  let best: K | null = null;
  let bestScore = 0;
  for (const key of Object.keys(table) as K[]) {
    const s = score(text, table[key]);
    if (s > bestScore) {
      best = key;
      bestScore = s;
    }
  }
  return best;
}

/** Q1 — infer the situation track from what the user typed. */
export function matchTrack(q1Text: string): Q1Track {
  const id = bestKey(q1Text, TRACK_KEYWORDS) ?? DEFAULT_TRACK_ID;
  return Q1_TRACKS.find((t) => t.id === id) ?? Q1_TRACKS[0];
}

/**
 * Q2 — find every module whose keywords appear in the typed details.
 * Modules in the inferred track are listed first. Falls back to the Q1 text,
 * then to all of the track's modules, so a result is always returned.
 */
export function matchModuleIds(q2Text: string, q1Text: string, trackId: string): string[] {
  const trackModuleIds = (Q2_OPTIONS[trackId] ?? []).map((o) => o.moduleId);
  const allModuleIds = Object.values(Q2_OPTIONS)
    .flat()
    .map((o) => o.moduleId);
  const ordered = [...trackModuleIds, ...allModuleIds.filter((id) => !trackModuleIds.includes(id))];

  for (const text of [q2Text, `${q1Text} ${q2Text}`]) {
    const hits = ordered.filter((id) => score(text, MODULE_KEYWORDS[id] ?? []) > 0);
    if (hits.length > 0) return hits;
  }
  return trackModuleIds;
}

/** Q3 — infer which letter variant to show from the typed recipient. */
export function matchAddressee(q3Text: string): Q3Addressee {
  return bestKey(q3Text, ADDRESSEE_KEYWORDS) ?? DEFAULT_ADDRESSEE;
}
