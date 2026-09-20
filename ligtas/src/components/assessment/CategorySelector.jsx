import { useState, useEffect } from 'react';
import { Loader2, ArrowRight, Lock } from 'lucide-react';
import {
  ASSESSMENT_CATEGORIES,
  ENABLED_CATEGORIES_KEY,
  DEFAULT_ENABLED_CATEGORIES,
  QUESTIONS_PER_ATTEMPT_KEY,
  DEFAULT_QUESTIONS_PER_ATTEMPT,
  isCategoryEnabled,
  normalizeQuestionCount,
} from '../../lib/assessmentCategories';
import { fetchCategoryAvailability } from '../../lib/assessmentQuestionBank';
import { useSiteSetting } from '../../hooks/useSiteSetting';

/**
 * Category selection step. Shows one card per disaster category that the
 * admin has enabled (Admin > Assessment > Question Bank > Category Settings).
 * A category with no active questions for the chosen `type` is still listed
 * but locked, so players can tell it exists but isn't ready yet.
 *
 * Fetches its own inputs so the parent only has to pass `type`:
 *   - `site_settings.assessment_enabled_categories`    -> which cards to show
 *   - `site_settings.assessment_questions_per_attempt` -> "N questions" label
 *   - active question counts for `type`                -> locked vs. selectable
 */
export default function CategorySelector({ type, onSelect }) {
  const { value: enabledMap, loading: enabledLoading } = useSiteSetting(ENABLED_CATEGORIES_KEY, DEFAULT_ENABLED_CATEGORIES);
  const { value: perAttemptSetting } = useSiteSetting(QUESTIONS_PER_ATTEMPT_KEY, DEFAULT_QUESTIONS_PER_ATTEMPT);
  const [availability, setAvailability] = useState(null); // null while loading

  useEffect(() => {
    let cancelled = false;
    fetchCategoryAvailability(type).then((counts) => { if (!cancelled) setAvailability(counts); });
    return () => { cancelled = true; };
  }, [type]);

  const perAttempt = normalizeQuestionCount(perAttemptSetting);
  const visibleCategories = ASSESSMENT_CATEGORIES.filter((c) => isCategoryEnabled(enabledMap, c.id));

  if (enabledLoading || availability === null) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
        <Loader2 className="animate-spin" size={24} />
        <span className="font-bold text-sm">Loading categories...</span>
      </div>
    );
  }

  if (visibleCategories.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
        <p className="text-lg font-black text-slate-800 mb-1">No categories are open right now</p>
        <p className="text-sm font-medium text-gray-500">Please check back soon.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-center text-slate-500 text-sm font-bold mb-8">
        Pick the disaster category you want to test your knowledge on.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleCategories.map((category) => {
          const available = availability[category.id] || 0;
          const locked = available === 0;
          const questionCount = Math.min(available, perAttempt);
          return (
            <button
              key={category.id}
              type="button"
              disabled={locked}
              onClick={() => onSelect(category.id)}
              className={`group text-left rounded-[2rem] border-2 p-7 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/30 ${
                locked
                  ? 'bg-slate-50 border-slate-100 cursor-not-allowed'
                  : 'bg-white border-slate-100 hover:border-orange-400 shadow-sm hover:shadow-xl hover:shadow-orange-100'
              }`}
            >
              <div className={`text-5xl mb-4 ${locked ? 'grayscale opacity-50' : ''}`} aria-hidden="true">{category.emoji}</div>
              <h3 className={`text-xl font-black tracking-tight mb-1.5 ${locked ? 'text-slate-400' : 'text-slate-800'}`}>{category.label}</h3>
              <p className={`text-sm font-medium leading-relaxed mb-5 ${locked ? 'text-slate-300' : 'text-slate-500'}`}>{category.blurb}</p>
              {locked ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider">
                  <Lock size={13} /> No questions yet
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-xs font-black text-orange-500 uppercase tracking-wider group-hover:gap-3 transition-all">
                  {questionCount} question{questionCount !== 1 ? 's' : ''} <ArrowRight size={14} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
