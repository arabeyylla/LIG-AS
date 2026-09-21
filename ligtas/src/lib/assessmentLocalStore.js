// ---------------------------------------------------------------------------
// Small browser-side conveniences for the Assessment page. Everything
// important (scores, sessions, game results) lives in Supabase and is looked
// up by Game Code — this file only remembers two things so a refresh is less
// painful. Every accessor is wrapped in try/catch because storage can be
// blocked (private windows, strict privacy settings).
// ---------------------------------------------------------------------------

const CONSENT_KEY = 'ligtas_assessment_consent';   // sessionStorage: privacy consent for this tab session
const GAME_CODE_KEY = 'ligtas_active_game_code';   // localStorage: last Game Code, survives closing the tab

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

/** The last Game Code this browser used, so "Resume / Enter Code" can pre-fill it. */
export function loadSavedGameCode() {
  try {
    return localStorage.getItem(GAME_CODE_KEY) || '';
  } catch {
    return '';
  }
}

export function saveGameCode(code) {
  try {
    localStorage.setItem(GAME_CODE_KEY, code);
  } catch {
    /* storage unavailable — the player can still type the code again */
  }
}
