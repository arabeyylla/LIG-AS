import { useState, useEffect } from 'react';
import { Loader2, ArrowRight, Lock } from 'lucide-react';
import {
  GAME_CATEGORIES,
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
 * Module selection for the start of a session (Pre-Test -> Game Code ->
 * Post-Test). Shows one card per module that has a Unity scenario and that the
 * admin has enabled (Admin > Assessment > Question Bank > Category Settings).
 *
 * A module is locked ("Not ready yet") unless it has active questions for BOTH
 * the Pre-Test and the Post-Test — otherwise a player could finish the game
 * and then find there is no Post-Test to take.
 *
 * Fetches its own inputs:
 *   - `site_settings.assessment_enabled_categories`    -> which cards to show
 *   - `site_settings.assessment_questions_per_attempt` -> "N questions" label
 *   - active question counts for Pre and Post          -> locked vs. selectable
 */
export default function CategorySelector({ onSelect }) {
  const { value: enabledMap, loading: enabledLoading } = useSiteSetting(ENABLED_CATEGORIES_KEY, DEFAULT_ENABLED_CATEGORIES);
  const { value: perAttemptSetting } = useSiteSetting(QUESTIONS_PER_ATTEMPT_KEY, DEFAULT_QUESTIONS_PER_ATTEMPT);
  const [availability, setAvailability] = useState(null); // { pre: counts, post: counts }; null while loading

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchCategoryAvailability('pre'), fetchCategoryAvailability('post')]).then(([pre, post]) => {
      if (!cancelled) setAvailability({ pre, post });
    });
    return () => { cancelled = true; };
  }, []);

  const perAttempt = normalizeQuestionCount(perAttemptSetting);
  const visibleCategories = GAME_CATEGORIES.filter((c) => isCategoryEnabled(enabledMap, c.id));

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
        Pick the disaster module you want to train on. You'll play the matching scenario in the LIG+AS mobile app.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleCategories.map((category) => {
          const available = Math.min(availability.pre[category.id] || 0, availability.post[category.id] || 0);
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
                  <Lock size={13} /> Not ready yet
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
