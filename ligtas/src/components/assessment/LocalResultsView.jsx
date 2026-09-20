import { ClipboardCheck, ArrowRight } from 'lucide-react';
import { ASSESSMENT_CATEGORIES } from '../../lib/assessmentCategories';
import { percentOf } from '../../lib/assessmentScoring';

/**
 * "My results" — this device/browser session's Pre vs. Post scores, one card
 * per category the player has completed. See lib/assessmentLocalStore.js for
 * why this reads from sessionStorage instead of Supabase.
 */
export default function LocalResultsView({ localResults, onStart }) {
  const completed = ASSESSMENT_CATEGORIES.filter((c) => {
    const entry = localResults?.results?.[c.id];
    return entry?.pre || entry?.post;
  });

  if (completed.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
        <ClipboardCheck className="text-orange-300 mx-auto mb-4" size={44} />
        <h3 className="text-xl font-black text-slate-800 mb-2">No results yet</h3>
        <p className="text-gray-500 text-sm font-medium mb-6 max-w-sm mx-auto">
          Complete a Pre-Assessment to see your score here. Come back after playing LIG+AS to compare it with your Post-Assessment.
        </p>
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-200"
        >
          Start an assessment <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {completed.map((category) => {
        const { pre, post } = localResults.results[category.id];
        const prePercent = pre ? percentOf(pre.score, pre.total) : null;
        const postPercent = post ? percentOf(post.score, post.total) : null;
        const delta = prePercent !== null && postPercent !== null ? postPercent - prePercent : null;

        return (
          <div key={category.id} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
              <h3 className="text-lg font-black text-slate-800">
                <span aria-hidden="true">{category.emoji}</span> {category.label}
              </h3>
              {delta !== null && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    delta > 0 ? 'bg-green-50 text-green-600' : delta < 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {delta > 0 ? '+' : ''}{delta}% knowledge gain
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: 'pre', label: 'Pre-Assessment', data: pre, percent: prePercent },
                { key: 'post', label: 'Post-Assessment', data: post, percent: postPercent },
              ].map(({ key, label, data, percent }) => (
                <div key={key} className="bg-slate-50 rounded-xl p-5">
                  <span className="text-[11px] font-black text-orange-500 uppercase tracking-widest">{label}</span>
                  {data ? (
                    <>
                      <div className="mt-2 text-3xl font-black text-slate-800">{percent}%</div>
                      <p className="text-xs font-bold text-slate-400 mt-1">
                        {data.score} / {data.total} correct &middot; Confidence {data.confidence}/5
                      </p>
                      <p className="text-[11px] font-bold text-gray-300 mt-2">Submitted {new Date(data.submittedAt).toLocaleString()}</p>
                    </>
                  ) : (
                    <p className="mt-3 text-sm font-bold text-gray-400">Not completed yet.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <p className="text-center text-xs font-bold text-gray-400">
        Results shown here are limited to this device/browser session. Administrators can review aggregate results across
        all participants from the admin dashboard.
      </p>
    </div>
  );
}
