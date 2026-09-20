// ---------------------------------------------------------------------------
// Local (per-browser) results cache.
// RLS on `assessment_results` only grants admins SELECT access (see the SQL
// migrations), so the public page cannot query past submissions back from
// Supabase for an anonymous player. Instead, each successful submission is
// mirrored into sessionStorage so the "My Results" view can show a
// same-device Pre vs. Post comparison per category. Aggregate results across
// all participants belong on the authenticated admin page.
//
// Shape: { participantId, results: { [categoryId]: { pre: payload|null, post: payload|null } } }
// The key is versioned (`_v2`) because the previous shape stored a single
// pre/post pair for the whole assessment, not one per category.
// ---------------------------------------------------------------------------

const RESULTS_KEY = 'ligtas_assessment_results_v2';
const CONSENT_KEY = 'ligtas_assessment_consent';

const EMPTY = () => ({ participantId: '', results: {} });

export function loadLocalResults() {
  try {
    const raw = sessionStorage.getItem(RESULTS_KEY);
    return raw ? JSON.parse(raw) : EMPTY();
  } catch {
    return EMPTY();
  }
}

/**
 * Records `payload` ({ type: 'pre'|'post', score, total, confidence,
 * submittedAt }) for `category`. A different participant id starts a fresh
 * cache so two people sharing a device never see each other's results.
 * Returns the updated cache, or null if storage is unavailable.
 */
export function saveLocalResult(participantId, category, payload) {
  try {
    const current = loadLocalResults();
    const next = current.participantId === participantId ? current : { participantId, results: {} };
    next.participantId = participantId;
    next.results[category] = { pre: null, post: null, ...next.results[category], [payload.type]: payload };
    sessionStorage.setItem(RESULTS_KEY, JSON.stringify(next));
    return next;
  } catch (err) {
    console.warn('Could not persist local assessment result:', err.message);
    return null;
  }
}

export function loadStoredConsent() {
  try {
    return sessionStorage.getItem(CONSENT_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveStoredConsent(value) {
  try {
    sessionStorage.setItem(CONSENT_KEY, String(value));
  } catch {
    /* storage unavailable — consent just won't persist across modal openings */
  }
}
