// CSV / JSON export of Guest Player Tracking rows for research reporting.
// Rows are the `admin_guest_sessions` view (see hooks/useGuestSessions.js).

const percent = (score, total) => (total > 0 ? Math.round((score / total) * 100) : null);

/** [column key, value getter] — one entry per exported column, in file order. */
const COLUMNS = [
  ['game_code', (r) => r.game_code],
  ['module', (r) => r.module],
  ['status', (r) => r.status],
  ['guest_id', (r) => r.guest_id],
  ['participant_identifier', (r) => r.identifier],
  ['created_at', (r) => r.created_at],
  ['expires_at', (r) => r.expired_at],
  ['pre_test_completed_at', (r) => r.pre_completed_at],
  ['game_started_at', (r) => r.game_started_at],
  ['game_completed_at', (r) => r.game_completed_at],
  ['post_test_completed_at', (r) => r.post_completed_at],
  ['pre_score', (r) => r.pre_score],
  ['pre_total', (r) => r.pre_total],
  ['pre_percent', (r) => percent(r.pre_score, r.pre_total)],
  ['game_score', (r) => r.game_score],
  ['completion_time_seconds', (r) => r.completion_time_seconds],
  ['hazards_avoided', (r) => r.hazards_avoided],
  ['hazards_total', (r) => r.hazards_total],
  ['checklist_completed', (r) => r.checklist_completed],
  ['checklist_total', (r) => r.checklist_total],
  ['post_score', (r) => r.post_score],
  ['post_total', (r) => r.post_total],
  ['post_percent', (r) => percent(r.post_score, r.post_total)],
  ['knowledge_gain_points', (r) => (r.knowledge_gain === null || r.knowledge_gain === undefined ? null : Number(r.knowledge_gain))],
];

/** Flattens view rows into plain objects keyed by the export column names. */
export function toExportRecords(rows) {
  return rows.map((row) => Object.fromEntries(COLUMNS.map(([key, get]) => [key, get(row) ?? null])));
}

// Participant identifiers are free text typed by players, and spreadsheets run
// cells that begin with = + - @ as formulas. Prefixing an apostrophe makes
// them inert. Only strings are touched, so negative numbers stay numeric.
function csvCell(value) {
  if (value === null || value === undefined) return '';
  let text = String(value);
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function sessionsToCsv(rows) {
  const records = toExportRecords(rows);
  const header = COLUMNS.map(([key]) => key).join(',');
  const lines = records.map((record) => COLUMNS.map(([key]) => csvCell(record[key])).join(','));
  return [header, ...lines].join('\r\n');
}

export function sessionsToJson(rows) {
  return JSON.stringify(toExportRecords(rows), null, 2);
}

function download(filename, content, mime) {
  const url = URL.createObjectURL(new Blob([content], { type: `${mime};charset=utf-8` }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Downloads `rows` as `format` ('csv' | 'json'), named with today's date. */
export function exportSessions(rows, format) {
  const stamp = new Date().toISOString().slice(0, 10);
  if (format === 'json') {
    download(`ligtas-guest-sessions-${stamp}.json`, sessionsToJson(rows), 'application/json');
  } else {
    // BOM so Excel opens the UTF-8 file with the right encoding.
    download(`ligtas-guest-sessions-${stamp}.csv`, `\uFEFF${sessionsToCsv(rows)}`, 'text/csv');
  }
}
