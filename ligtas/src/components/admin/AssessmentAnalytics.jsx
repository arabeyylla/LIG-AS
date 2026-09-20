import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, Gauge, Loader2 } from 'lucide-react';
import { useAssessmentResults } from '../../hooks/useAssessmentResults';
import { ASSESSMENT_CATEGORIES, getCategory } from '../../lib/assessmentCategories';

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
 * not `compact`) a per-category Knowledge Gain breakdown and a before/after
 * preparedness confidence comparison.
 *
 * Knowledge Gain = Post average % minus Pre average % (percentage points),
 * where each average is pooled (total correct / total questions) over every
 * `assessment_results` row for that category and type. `disaster_module` on
 * each row holds the category id.
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

  // Only categories that have at least one submission, so an unused or
  // disabled category doesn't add an empty row. Categories that appear in the
  // data but are no longer configured (e.g. the retired 'Flood') are appended
  // so their historical results still show up here.
  const categoryStats = useMemo(() => {
    const knownIds = new Set(ASSESSMENT_CATEGORIES.map((c) => c.id));
    const legacyIds = [...new Set(rows.map((r) => r.disaster_module).filter((id) => id && !knownIds.has(id)))];
    return [...ASSESSMENT_CATEGORIES, ...legacyIds.map(getCategory)]
      .map((category) => {
        const categoryRows = rows.filter((r) => r.disaster_module === category.id);
        const catPre = summarize(categoryRows, 'pre-assessment');
        const catPost = summarize(categoryRows, 'post-assessment');
        const gain = catPre.percent !== null && catPost.percent !== null ? catPost.percent - catPre.percent : null;
        return { category, pre: catPre, post: catPost, gain, submissions: categoryRows.length };
      })
      .filter((stat) => stat.submissions > 0);
  }, [rows]);

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
        <MetricCard label="Avg. Pre-Assessment Score" value={pre.percent !== null ? `${pre.percent}%` : '—'} sub={`${pre.rowCount} submission${pre.rowCount !== 1 ? 's' : ''}`} />
        <MetricCard label="Avg. Post-Assessment Score" value={post.percent !== null ? `${post.percent}%` : '—'} sub={`${post.rowCount} submission${post.rowCount !== 1 ? 's' : ''}`} accent />
        <DeltaCard delta={delta} />
      </div>

      {!compact && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="text-blue-500" size={22} />
              <h3 className="font-black text-slate-800 text-lg">Knowledge Gain by Category</h3>
            </div>
            {categoryStats.length === 0 ? (
              <p className="text-slate-400 font-bold text-sm text-center py-6">No submissions yet.</p>
            ) : (
              <div className="space-y-6">
                {categoryStats.map(({ category, pre: catPre, post: catPost, gain }) => (
                  <div key={category.id}>
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <span className="text-sm font-black text-slate-700">
                        <span aria-hidden="true">{category.emoji}</span> {category.label}
                      </span>
                      <GainBadge gain={gain} />
                    </div>
                    <ScoreBar label="Pre" percent={catPre.percent} count={catPre.rowCount} barClass="bg-slate-400" />
                    <ScoreBar label="Post" percent={catPost.percent} count={catPost.rowCount} barClass="bg-orange-500" />
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

function GainBadge({ gain }) {
  if (gain === null) {
    return <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">Needs Pre + Post</span>;
  }
  const tone = gain > 0 ? 'bg-green-50 text-green-600' : gain < 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500';
  return <span className={`px-2.5 py-1 rounded-md text-xs font-black ${tone}`}>{gain > 0 ? '+' : ''}{gain}%</span>;
}

function ScoreBar({ label, percent, count, barClass }) {
  return (
    <div className="flex items-center gap-3 mb-1.5 last:mb-0">
      <span className="text-xs font-black text-slate-400 uppercase tracking-wider w-9 flex-shrink-0">{label}</span>
      <div className="flex-1 h-6 bg-slate-50 rounded-lg overflow-hidden relative">
        {percent !== null && (
          <div className={`h-full rounded-lg transition-all duration-500 ${barClass}`} style={{ width: `${Math.max(percent, 3)}%` }} />
        )}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-600">{percent !== null ? `${percent}%` : '—'}</span>
      </div>
      <span className="text-[11px] font-bold text-slate-300 w-10 text-right flex-shrink-0">n={count}</span>
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
