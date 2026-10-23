// ---------------------------------------------------------------------------
// Single source of truth for Assessment disaster categories.
//
// `id` is the value stored in Supabase: `assessment_questions.module` and
// `assessment_results.disaster_module` (both CHECK-constrained — keep this
// list in sync with supabase/migrations/20260921_assessment_categories.sql
// when adding a category). Everything else here is presentation only.
// ---------------------------------------------------------------------------

export const ASSESSMENT_CATEGORIES = [
  {
    id: 'Earthquake',
    label: 'Earthquake',
    emoji: '🏚️',
    blurb: 'Drop, Cover, and Hold On — staying safe before, during, and after shaking.',
    situation: 'an earthquake',
    hasGameScenario: true,
  },
  {
    id: 'Typhoon',
    label: 'Typhoon',
    emoji: '🌀',
    blurb: 'Storm signals, preparation, and staying safe when a typhoon makes landfall.',
    situation: 'a typhoon',
    hasGameScenario: true,
  },
  {
    id: 'Landslide',
    label: 'Landslide',
    emoji: '⛰️',
    blurb: 'Warning signs on unstable slopes, moving to stable ground, and safe evacuation routes.',
    situation: 'a landslide',
    hasGameScenario: true,
  },
  {
    id: 'Tsunami',
    label: 'Tsunami',
    emoji: '🌊',
    blurb: 'Natural warning signs, reaching high ground fast, and staying away from the coast.',
    situation: 'a tsunami',
    hasGameScenario: true,
  },
  {
    id: 'Volcanic Eruption',
    label: 'Volcanic Eruption / Ashfall',
    emoji: '🌋',
    blurb: 'Ashfall protection, evacuation timing, and keeping clear of volcanic hazard zones.',
    situation: 'a volcanic eruption',
    hasGameScenario: true,
  },
  {
    id: 'General',
    label: 'General Preparedness',
    emoji: '🎒',
    blurb: 'Go-bags, family plans, and habits that apply to every kind of disaster.',
    situation: 'a disaster (earthquake, typhoon, landslide, tsunami, or volcanic eruption)',
    hasGameScenario: false, // no Unity scenario, so it cannot take part in the Game Code flow
  },
];

export const CATEGORY_IDS = ASSESSMENT_CATEGORIES.map((c) => c.id);

/**
 * Categories that have a matching Unity scenario. Only these can start the
 * Pre-Test -> Game Code -> Post-Test flow; the list must match the modules
 * accepted by supabase/migrations/20260922_game_code_sessions.sql.
 */
export const GAME_CATEGORIES = ASSESSMENT_CATEGORIES.filter((c) => c.hasGameScenario);

/** Category config for a stored id, or a neutral fallback for unknown/legacy values. */
export function getCategory(id) {
  return (
    ASSESSMENT_CATEGORIES.find((c) => c.id === id) || {
      id,
      label: id || 'Unknown',
      emoji: '📋',
      blurb: '',
      situation: 'a disaster',
      hasGameScenario: false,
    }
  );
}

// --- Admin-managed settings (stored in `site_settings`) ---------------------

/** { [categoryId]: boolean } — categories missing from the map count as enabled. */
export const ENABLED_CATEGORIES_KEY = 'assessment_enabled_categories';
export const DEFAULT_ENABLED_CATEGORIES = Object.fromEntries(CATEGORY_IDS.map((id) => [id, true]));

/** Number of questions drawn per attempt (fewer if a category has fewer active questions). */
export const QUESTIONS_PER_ATTEMPT_KEY = 'assessment_questions_per_attempt';
export const DEFAULT_QUESTIONS_PER_ATTEMPT = 10;
/** Hard ceiling, also enforced by a check constraint on `site_settings`. */
export const MAX_QUESTIONS_PER_ATTEMPT = 50;

export function isCategoryEnabled(enabledMap, id) {
  return enabledMap?.[id] !== false;
}

/**
 * Coerces the stored setting to a whole number from 1 to MAX_QUESTIONS_PER_ATTEMPT.
 * Invalid values (blank, 0, negative, text) fall back to the default; values
 * above the ceiling are capped.
 */
export function normalizeQuestionCount(value) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 1) return DEFAULT_QUESTIONS_PER_ATTEMPT;
  return Math.min(n, MAX_QUESTIONS_PER_ATTEMPT);
}

/**
 * Validates what an admin typed for "Questions per attempt".
 * `maxAvailable` is the most questions any visible module can serve for BOTH
 * its Pre-Test and Post-Test (capped at MAX_QUESTIONS_PER_ATTEMPT), or null
 * while the question bank is still loading.
 * Returns an error message, or null when the value is valid.
 */
export function validateQuestionCount(raw, maxAvailable) {
  const text = String(raw ?? '').trim();
  if (text === '') return 'Enter how many questions each attempt should draw.';
  if (!/^\d+$/.test(text)) return 'Enter a whole number (no decimals, letters, or negative values).';
  const n = Number(text);
  if (n < 1) return 'Each attempt needs at least 1 question.';
  if (n > MAX_QUESTIONS_PER_ATTEMPT) return `Each attempt can draw at most ${MAX_QUESTIONS_PER_ATTEMPT} questions.`;
  if (maxAvailable === null) return null;
  if (maxAvailable === 0) return 'No visible module has both active Pre-Test and Post-Test questions yet. Add questions first.';
  if (n > maxAvailable) {
    return `Can't be more than ${maxAvailable}: no visible module has more than ${maxAvailable} active Pre-Test and Post-Test questions.`;
  }
  return null;
}
