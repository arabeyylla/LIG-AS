import { useState, useMemo } from 'react';
import { Search, Loader2, Users, ChevronDown, ChevronUp, Download, FileJson, CheckCircle2, Circle, RefreshCw } from 'lucide-react';
import { useGuestSessions } from '../../hooks/useGuestSessions';
import { GAME_CATEGORIES, getCategory } from '../../lib/assessmentCategories';
import { SESSION_STATUS } from '../../lib/assessmentSessions';
import { percentOf, formatDuration } from '../../lib/assessmentScoring';
import { exportSessions } from '../../lib/exportSessions';

const STATUS_META = {
  [SESSION_STATUS.WAITING]: { label: 'Waiting for game', badge: 'bg-amber-100 text-amber-700' },
  [SESSION_STATUS.GAME_DONE]: { label: 'Game completed', badge: 'bg-blue-100 text-blue-700' },
  [SESSION_STATUS.POST_DONE]: { label: 'Post-Test done', badge: 'bg-green-100 text-green-700' },
  [SESSION_STATUS.EXPIRED]: { label: 'Expired', badge: 'bg-slate-200 text-slate-600' },
};

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString(undefined, { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

/**
 * "Guest Sessions" tab of the admin Assessment page: every Game Code session
 * with its guest id, module, status, progress timeline and Pre / Game / Post
 * scores plus Knowledge Gain, with filters (module, status, guest / code /
 * participant search, date range) and CSV / JSON export of the filtered rows.
 */
export default function GuestSessionTracker() {
  const { rows, loading, error, refetch } = useGuestSessions();

  const [statusFilter, setStatusFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    // Date inputs are local calendar days: from = start of that day, to = end of that day.
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;

    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (moduleFilter !== 'all' && r.module !== moduleFilter) return false;
      const created = new Date(r.created_at).getTime();
      if (from !== null && created < from) return false;
      if (to !== null && created > to) return false;
      if (needle) {
        const haystack = [r.guest_id, r.game_code, r.identifier].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [rows, statusFilter, moduleFilter, search, dateFrom, dateTo]);

  const counts = useMemo(() => {
    const tally = { [SESSION_STATUS.WAITING]: 0, [SESSION_STATUS.GAME_DONE]: 0, [SESSION_STATUS.POST_DONE]: 0, [SESSION_STATUS.EXPIRED]: 0 };
    filteredRows.forEach((r) => { if (r.status in tally) tally[r.status] += 1; });
    return tally;
  }, [filteredRows]);

  const hasFilters = statusFilter !== 'all' || moduleFilter !== 'all' || search || dateFrom || dateTo;

  function clearFilters() {
    setStatusFilter('all');
    setModuleFilter('all');
    setSearch('');
    setDateFrom('');
    setDateTo('');
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-5 rounded-2xl border border-red-100 bg-red-50 text-red-700">
          <p className="font-black">Guest sessions could not be loaded.</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-xs mt-2 text-red-500">If this says the view does not exist, run supabase/migrations/20260922_game_code_sessions.sql.</p>
          <button onClick={refetch} className="mt-3 text-sm font-black underline">Try again</button>
        </div>
      )}

      {/* Status summary (reflects the current filters) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(STATUS_META).map(([status, meta]) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
            className={`text-left bg-white rounded-2xl border p-5 shadow-sm transition-all ${statusFilter === status ? 'border-orange-400 ring-2 ring-orange-500/20' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${meta.badge}`}>{meta.label}</span>
            <p className="text-3xl font-black text-slate-800 mt-2">{counts[status]}</p>
          </button>
        ))}
      </div>

      {/* Filters + export */}
      <div className="flex flex-wrap items-end gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <FilterSelect label="Module" value={moduleFilter} onChange={setModuleFilter}>
          <option value="all">All Modules</option>
          {GAME_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </FilterSelect>
        <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter}>
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_META).map(([status, meta]) => <option key={status} value={status}>{meta.label}</option>)}
        </FilterSelect>
        <div>
          <label htmlFor="sessions-from" className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">From</label>
          <input id="sessions-from" type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-600 outline-none" />
        </div>
        <div>
          <label htmlFor="sessions-to" className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">To</label>
          <input id="sessions-to" type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-600 outline-none" />
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guest ID, game code, or participant..."
            aria-label="Search sessions"
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-orange-400"
          />
        </div>
        {hasFilters && <button onClick={clearFilters} className="px-3 py-2.5 text-xs font-black text-slate-400 hover:text-slate-700 uppercase tracking-wider">Clear</button>}
        <div className="flex gap-2 ml-auto">
          <button onClick={refetch} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors" title="Refresh" aria-label="Refresh"><RefreshCw size={16} /></button>
          <button onClick={() => exportSessions(filteredRows, 'csv')} disabled={filteredRows.length === 0} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Download size={14} /> CSV
          </button>
          <button onClick={() => exportSessions(filteredRows, 'json')} disabled={filteredRows.length === 0} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <FileJson size={14} /> JSON
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center py-20 text-slate-400 gap-4">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold">Loading guest sessions...</p>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
          <Users className="text-slate-200 mx-auto mb-4" size={48} />
          <p className="text-slate-400 font-bold">{rows.length === 0 ? 'No game sessions yet.' : 'No sessions match your filters.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="w-10 px-4 py-4"><span className="sr-only">Details</span></th>
                  {['Guest', 'Game Code', 'Module', 'Status', 'Pre-Test', 'Game Score', 'Post-Test', 'Gain', 'Created'].map((heading) => (
                    <th key={heading} className="px-4 py-4 font-black text-slate-400 uppercase text-xs tracking-wider whitespace-nowrap">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <SessionRow key={row.id} row={row} expanded={expandedId === row.id} onToggle={() => setExpandedId(expandedId === row.id ? null : row.id)} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filteredRows.length > 0 && (
        <p className="text-center text-sm text-slate-400">{filteredRows.length} session{filteredRows.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black uppercase tracking-wide text-slate-600 outline-none cursor-pointer">
        {children}
      </select>
    </div>
  );
}

function scoreText(score, total) {
  if (score === null || score === undefined) return '—';
  return `${score}/${total} (${percentOf(score, total)}%)`;
}

export function SessionRow({ row, expanded, onToggle }) {
  const category = getCategory(row.module);
  const meta = STATUS_META[row.status] ?? { label: row.status, badge: 'bg-slate-100 text-slate-600' };
  const gain = row.knowledge_gain === null || row.knowledge_gain === undefined ? null : Number(row.knowledge_gain);
  const Chevron = expanded ? ChevronUp : ChevronDown;

  return (
    <>
      <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={onToggle}>
        <td className="px-4 py-4">
          <button type="button" aria-expanded={expanded} aria-label={expanded ? 'Hide details' : 'Show details'} className="text-slate-300 hover:text-slate-600">
            <Chevron size={16} />
          </button>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <p className="font-bold text-slate-800 font-mono text-xs">{row.guest_id ?? <span className="font-sans text-slate-300">Not linked yet</span>}</p>
          <p className="text-xs font-bold text-slate-400 mt-0.5">{row.identifier}</p>
        </td>
        <td className="px-4 py-4 font-black text-slate-700 tracking-widest whitespace-nowrap">{row.game_code}</td>
        <td className="px-4 py-4 font-bold text-slate-600 whitespace-nowrap"><span aria-hidden="true">{category.emoji}</span> {category.label}</td>
        <td className="px-4 py-4 whitespace-nowrap"><span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${meta.badge}`}>{meta.label}</span></td>
        <td className="px-4 py-4 font-bold text-slate-600 whitespace-nowrap">{scoreText(row.pre_score, row.pre_total)}</td>
        <td className="px-4 py-4 font-bold text-slate-600 whitespace-nowrap">{row.game_score ?? '—'}</td>
        <td className="px-4 py-4 font-bold text-slate-600 whitespace-nowrap">{scoreText(row.post_score, row.post_total)}</td>
        <td className="px-4 py-4 whitespace-nowrap">
          {gain === null ? <span className="text-slate-300 font-bold">—</span> : (
            <span className={`font-black ${gain > 0 ? 'text-green-600' : gain < 0 ? 'text-red-600' : 'text-slate-500'}`}>{gain > 0 ? '+' : ''}{gain}%</span>
          )}
        </td>
        <td className="px-4 py-4 text-slate-400 font-bold text-xs whitespace-nowrap">{formatDateTime(row.created_at)}</td>
      </tr>
      {expanded && (
        <tr className="border-b border-slate-50 bg-slate-50/60">
          <td colSpan={10} className="px-6 sm:px-10 py-6">
            <SessionDetail row={row} />
          </td>
        </tr>
      )}
    </>
  );
}

function SessionDetail({ row }) {
  const timeline = [
    { label: 'Pre-Test completed', at: row.pre_completed_at },
    { label: 'Game started (code entered in app)', at: row.game_started_at },
    { label: 'Game completed (results uploaded)', at: row.game_completed_at },
    { label: 'Post-Test submitted', at: row.post_completed_at },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Progress timeline</p>
        <ol className="space-y-3">
          {timeline.map((step) => (
            <li key={step.label} className="flex items-start gap-3">
              {step.at ? <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" /> : <Circle size={18} className="text-slate-300 flex-shrink-0" />}
              <span>
                <span className={`block text-sm font-black ${step.at ? 'text-slate-700' : 'text-slate-400'}`}>{step.label}</span>
                <span className="block text-xs font-bold text-slate-400">{formatDateTime(step.at) ?? 'Pending'}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-xs font-bold text-slate-400 mt-4">Code {row.status === SESSION_STATUS.EXPIRED ? 'expired' : 'expires'} {formatDateTime(row.expired_at)}</p>
      </div>

      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Mobile game evaluation</p>
        {row.game_score === null || row.game_score === undefined ? (
          <p className="text-sm font-bold text-slate-400">No game data uploaded yet.</p>
        ) : (
          <dl className="grid grid-cols-2 gap-3">
            <Metric label="Game score" value={row.game_score.toLocaleString()} />
            <Metric label="Completion time" value={formatDuration(row.completion_time_seconds)} />
            <Metric label="Hazards avoided" value={`${row.hazards_avoided} / ${row.hazards_total}`} />
            <Metric label="Safety checklist" value={`${row.checklist_completed} / ${row.checklist_total}`} />
          </dl>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-white rounded-xl px-4 py-3 border border-slate-100">
      <dt className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</dt>
      <dd className="text-sm font-black text-slate-800 mt-0.5">{value}</dd>
    </div>
  );
}
