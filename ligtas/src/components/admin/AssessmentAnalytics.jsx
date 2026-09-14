import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, ClipboardCheck, Gauge, Loader2 } from 'lucide-react';
import { useAssessmentResults } from '../../hooks/useAssessmentResults';

const MODULES = ['Earthquake', 'Typhoon', 'Flood', 'General'];

function summarize(rows, assessmentType) {
  const subset = rows.filter((r) => r.assessment_type === assessmentType);
  const score = subset.reduce((sum, r) => sum + (r.score || 0), 0);
  const total = subset.reduce((sum, r) => sum + (r.total_questions || 0), 0);
  const confidenceValues = subset.map((r) => r.likert_preparedness_rating).filter((v) => v != null);
  const avgConfidence = confidenceValues.length ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length : null;
  return {
    percent: total ? Math.round((score / total) * 100) : null,
    rowCount: subset.length,
    avgConfidence,
  };
}

/**
 * Assessment analytics — comparative Pre vs. Post metric cards, plus (when
 * not `compact`) a per-disaster-module pass-rate breakdown and a
 * before/after preparedness confidence comparison.
 *
 * Self-contained: fetches its own data via useAssessmentResults(), so it
 * can be dropped into any admin page. Used at full size on the Assessment
 * Results admin page, and with `compact` on the Overview dashboard.
 */
export default function AssessmentAnalytics({ compact = false }) {
  const { rows, loading } = useAssessmentResults();

  const pre = useMemo(() => summarize(rows, 'pre-assessment'), [rows]);
  const post = useMemo(() => summarize(rows, 'post-assessment'), [rows]);
  const delta = pre.percent !== null && post.percent !== null ? post.percent - pre.percent : null;

  const moduleStats = useMemo(
    () =>
      MODULES.map((moduleName) => {
        const moduleRows = rows.filter((r) => r.disaster_module === moduleName);
        const score = moduleRows.reduce((sum, r) => sum + (r.score || 0), 0);
        const total = moduleRows.reduce((sum, r) => sum + (r.total_questions || 0), 0);
        return { module: moduleName, percent: total ? Math.round((score / total) * 100) : 0, attempts: moduleRows.length };
      }),
    [rows]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400 gap-3">
        <Loader2 className="animate-spin" size={24} />
        <span className="font-bold text-sm">Loading assessment analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard label="Avg. Pre-Assessment Score" value={pre.percent !== null ? `${pre.percent}%` : '—'} sub={`${pre.rowCount} module submissions`} />
        <MetricCard label="Avg. Post-Assessment Score" value={post.percent !== null ? `${post.percent}%` : '—'} sub={`${post.rowCount} module submissions`} accent />
        <DeltaCard delta={delta} />
      </div>

      {!compact && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardCheck className="text-blue-500" size={22} />
              <h3 className="font-black text-slate-800 text-lg">Pass Rate by Disaster Module</h3>
            </div>
            {moduleStats.every((m) => m.attempts === 0) ? (
              <p className="text-slate-400 font-bold text-sm text-center py-6">No submissions yet.</p>
            ) : (
              <div className="space-y-4">
                {moduleStats.map((m) => (
                  <div key={m.module} className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-600 w-24 flex-shrink-0">{m.module}</span>
                    <div className="flex-1 h-8 bg-slate-50 rounded-lg overflow-hidden relative">
                      <div className="h-full bg-blue-500 rounded-lg transition-all duration-500" style={{ width: `${Math.max(m.percent, m.attempts ? 3 : 0)}%` }} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-600">{m.attempts ? `${m.percent}%` : '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Gauge className="text-teal-500" size={22} />
              <h3 className="font-black text-slate-800 text-lg">Preparedness Confidence</h3>
            </div>
            <ConfidenceBar label="Before playing (Pre)" avg={pre.avgConfidence} />
            <ConfidenceBar label="After playing (Post)" avg={post.avgConfidence} />
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 lg:p-8 shadow-sm">
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-3xl lg:text-4xl font-black tracking-tighter ${accent ? 'text-orange-500' : 'text-slate-800'}`}>{value}</p>
      <p className="text-xs font-bold text-slate-300 mt-2">{sub}</p>
    </div>
  );
}

function DeltaCard({ delta }) {
  const isUp = delta > 0;
  const isDown = delta < 0;
  return (
    <div className={`rounded-[2rem] p-6 lg:p-8 shadow-sm text-white ${isUp ? 'bg-green-500' : isDown ? 'bg-red-500' : 'bg-slate-800'}`}>
      <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Knowledge Gain</p>
      <div className="flex items-center gap-2">
        {isUp && <TrendingUp size={26} />}
        {isDown && <TrendingDown size={26} />}
        {!isUp && !isDown && <Minus size={26} />}
        <p className="text-3xl lg:text-4xl font-black tracking-tighter">{delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta}%`}</p>
      </div>
      <p className="text-xs font-bold opacity-80 mt-2">
        {delta === null ? 'Needs both Pre- and Post-Assessment data' : `Knowledge ${isUp ? 'increase' : isDown ? 'decrease' : 'change'} after playing LIG+AS`}
      </p>
    </div>
  );
}

function ConfidenceBar({ label, avg }) {
  const pct = avg ? (avg / 5) * 100 : 0;
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-bold text-slate-600">{label}</span>
        <span className="text-sm font-black text-slate-800">{avg ? avg.toFixed(1) : '—'} / 5</span>
      </div>
      <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
        <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
