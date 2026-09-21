// Shared scoring helpers and self-evaluation copy for the public Assessment
// flow (quiz form, final results dashboard, certificate).

export const CONFIDENCE_LABELS = [
  'Not at all confident',
  'Slightly confident',
  'Moderately confident',
  'Very confident',
  'Extremely confident',
];

/** Likert prompt, phrased for the category being tested (see `situation` in assessmentCategories.js). */
export function confidenceQuestion(category) {
  return `On a scale of 1 to 5, how confident are you in your ability to respond to ${category.situation}?`;
}

/** Whole-number percentage, or null when there is nothing to divide by. */
export function percentOf(score, total) {
  if (!total) return null;
  return Math.round((score / total) * 100);
}

/** Knowledge Gain = Post % minus Pre % (percentage points); null if either is missing. */
export function knowledgeGain(prePercent, postPercent) {
  return prePercent === null || postPercent === null ? null : postPercent - prePercent;
}

/** 312 -> "5m 12s", 45 -> "45s"; "—" when there is no time. */
export function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '—';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return minutes > 0 ? `${minutes}m ${String(seconds).padStart(2, '0')}s` : `${seconds}s`;
}

// ---------------------------------------------------------------------------
// Performance rating.
//
// PLACEHOLDER POLICY — tune these to your evaluation rubric. The overall
// score is a weighted average of three 0–100 components: Post-Test score,
// hazards avoided, and safety checklist completion. A component whose data is
// missing is left out and the remaining weights are re-scaled, so a game that
// reports no checklist can still be rated. The raw game score is NOT used
// because its scale is defined by the Unity game, not by this app.
// ---------------------------------------------------------------------------
export const RATING_WEIGHTS = { post: 0.4, hazards: 0.3, checklist: 0.3 };

export const RATING_TIERS = [
  { min: 90, title: 'Disaster Preparedness Expert', message: 'Outstanding! You know what to do and you did it under pressure.' },
  { min: 75, title: 'Disaster Ready Responder', message: 'Strong work — you handled the scenario and know the key safety steps.' },
  { min: 50, title: 'Preparedness Achiever', message: 'A solid foundation. A little more practice will make your responses second nature.' },
  { min: 0, title: 'Preparedness Learner', message: 'Great start! Replay the scenario and review the safety steps to level up.' },
];

/**
 * @param {{ postPercent: number|null, hazardsPercent: number|null, checklistPercent: number|null }} parts
 * @returns {{ score: number, title: string, message: string }}
 */
export function getPerformanceRating({ postPercent, hazardsPercent, checklistPercent }) {
  const parts = [
    [postPercent, RATING_WEIGHTS.post],
    [hazardsPercent, RATING_WEIGHTS.hazards],
    [checklistPercent, RATING_WEIGHTS.checklist],
  ].filter(([value]) => value !== null && value !== undefined);

  const weightSum = parts.reduce((sum, [, weight]) => sum + weight, 0);
  const score = weightSum ? Math.round(parts.reduce((sum, [value, weight]) => sum + value * weight, 0) / weightSum) : 0;
  const tier = RATING_TIERS.find((t) => score >= t.min);
  return { score, title: tier.title, message: tier.message };
}
