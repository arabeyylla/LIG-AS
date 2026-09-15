import { X } from 'lucide-react';

/**
 * Reusable filter row for admin list pages: date range + optional
 * visibility/status toggle + a "Show latest N" limit selector. Purely
 * controlled — pass current values and onChange handlers; this component
 * holds no state itself, and applies no filtering on its own. Each admin
 * page filters its already-fetched rows client-side using these values
 * (see Announcements/Gallery/Feedback/SystemLogs), matching how this
 * codebase already filters admin lists elsewhere (e.g. Assessments.jsx).
 *
 * Pass `visibilityOptions` only for tables that actually have a show/hide
 * concept (Announcements, Gallery) — omit it to hide that control entirely
 * (Feedback keeps its own read/unread tabs; System Logs has no visibility
 * concept at all).
 */
export default function AdminFilterBar({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  visibility,
  onVisibilityChange,
  visibilityOptions,
  limit,
  onLimitChange,
  limitOptions = [50, 100],
}) {
  const hasDateFilter = Boolean(startDate || endDate);

  return (
    <div className="flex flex-wrap items-end gap-3 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">From</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-orange-400"
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">To</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-orange-400"
        />
      </div>

      {hasDateFilter && (
        <button
          onClick={() => { onStartDateChange(''); onEndDateChange(''); }}
          className="flex items-center gap-1 px-2.5 py-2 text-xs font-bold text-slate-400 hover:text-orange-500 transition-colors"
          title="Clear date range"
        >
          <X size={13} /> Clear dates
        </button>
      )}

      {visibilityOptions && (
        <div className="ml-auto sm:ml-0">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Visibility</label>
          <select
            value={visibility}
            onChange={(e) => onVisibilityChange(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black uppercase tracking-wide text-slate-600 outline-none cursor-pointer"
          >
            {visibilityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className={visibilityOptions ? '' : 'ml-auto sm:ml-0'}>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Show</label>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black uppercase tracking-wide text-slate-600 outline-none cursor-pointer"
        >
          {limitOptions.map((n) => (
            <option key={n} value={n}>Latest {n}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
