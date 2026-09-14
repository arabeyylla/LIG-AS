import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { supabase } from '../lib/supabase';
import { logSystemEvent } from '../lib/systemLogs';
import { trackPageVisit } from '../lib/analytics';
import Toast from '../components/Toast';
import {
  ClipboardCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  BarChart3,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Question bank — PARALLEL FORMS design.
// Pre- and Post-Assessment intentionally use DIFFERENT scenarios per module
// (not the same questions reworded) so a post-test score reflects retained
// understanding rather than memorization of the pre-test. Both sets still
// cover the same 4 modules with the SAME number of questions per module
// (Earthquake x2, Typhoon x2, Flood x1, General x1), which is what keeps
// the admin analytics' Pre-vs-Post and per-module comparisons meaningful.
//
// Distractors are written to be plausible rather than obviously wrong
// (common myths, half-right actions, tempting-but-risky shortcuts) so the
// questions test reasoning, not just elimination.
//
// `category` is the display label on the question card; `module` is the
// normalized disaster_module value written to Supabase — see handleSubmit,
// which groups questions by `module` into separate rows. `correctIndex` is
// the zero-based index of the correct option.
// ---------------------------------------------------------------------------
const PRE_QUESTIONS = [
  {
    id: 'pre-eq1',
    category: 'Earthquake',
    module: 'Earthquake',
    question: 'You are inside a classroom on the 3rd floor when strong shaking begins. What is the safest immediate action?',
    options: [
      'Immediately run for the stairwell to exit the building',
      'Drop to the ground, take cover under a sturdy desk, and hold on until the shaking stops',
      'Move to a doorway and brace yourself against the frame',
      'Stand against an interior wall away from windows',
    ],
    correctIndex: 1,
  },
  {
    id: 'pre-eq2',
    category: 'Earthquake',
    module: 'Earthquake',
    question: 'Immediately after strong shaking stops in a multi-story building, what should occupants do first, before evacuating?',
    options: [
      'Take the elevator down quickly in case of aftershocks',
      'Gather personal belongings from their desks before leaving',
      'Check themselves and others for injuries, then check for hazards like broken glass or gas odors',
      'Wait for an "all clear" announcement over the intercom before doing anything',
    ],
    correctIndex: 2,
  },
  {
    id: 'pre-ty1',
    category: 'Typhoon',
    module: 'Typhoon',
    question: 'A typhoon warning has just been raised for your area, and the storm is still 24 hours away. What should you prioritize now?',
    options: [
      'Wait until the rain starts before deciding whether to prepare',
      'Charge devices, secure loose outdoor items, and stock up on water and non-perishable food',
      'Board up all windows and evacuate immediately, regardless of your area’s risk level',
      'Turn off the main water supply to prevent flooding inside the house',
    ],
    correctIndex: 1,
  },
  {
    id: 'pre-ty2',
    category: 'Typhoon',
    module: 'Typhoon',
    question: 'During the height of a typhoon, the wind suddenly calms and the sky clears. What does this most likely mean?',
    options: [
      'The typhoon has passed and it is now safe to go outside',
      'You are in the eye of the storm — violent winds will resume, likely from the opposite direction',
      'The storm has weakened into a tropical depression',
      'It is safe to check for damage around your property',
    ],
    correctIndex: 1,
  },
  {
    id: 'pre-fl1',
    category: 'Flood',
    module: 'Flood',
    question: 'Floodwater has risen ankle-deep on the street outside your home, and your car is parked there. What is the safest choice?',
    options: [
      'Quickly drive the car to higher ground before the water rises further',
      'Leave the car — moving water as shallow as six inches can sweep it off the road or stall the engine',
      'Push the car manually into a garage to protect it',
      'Wait inside the car until the water recedes',
    ],
    correctIndex: 1,
  },
  {
    id: 'pre-gen1',
    category: 'General Preparedness',
    module: 'General',
    question: 'You’re assembling a family emergency ("go") bag for the first 72 hours. Which item is LEAST essential to prioritize?',
    options: [
      'A three-day supply of water and non-perishable food',
      'Copies of important documents in a waterproof pouch',
      'A portable gaming console for entertainment',
      'A battery-powered or hand-crank radio',
    ],
    correctIndex: 2,
  },
];

const POST_QUESTIONS = [
  {
    id: 'post-eq1',
    category: 'Earthquake',
    module: 'Earthquake',
    question: 'While driving during an earthquake, what is the correct response?',
    options: [
      'Speed up to reach a safe location as quickly as possible',
      'Slow down and pull over away from buildings, bridges, and overpasses, then stay inside until shaking stops',
      'Stop immediately wherever you are, even if that is under an overpass',
      'Get out of the car and lie flat on the road',
    ],
    correctIndex: 1,
  },
  {
    id: 'post-eq2',
    category: 'Earthquake',
    module: 'Earthquake',
    question: 'Several days after a major earthquake, smaller aftershocks are still occurring. What should residents of a visibly cracked building do?',
    options: [
      'Ignore the aftershocks since the main earthquake already happened',
      'Move back in as soon as the shaking feels weaker than the main quake',
      'Avoid re-entering until officials have inspected and cleared the structure, since aftershocks can cause further collapse',
      'Only avoid the building if it has already collapsed',
    ],
    correctIndex: 2,
  },
  {
    id: 'post-ty1',
    category: 'Typhoon',
    module: 'Typhoon',
    question: 'Local officials issue a mandatory evacuation order for your area as a typhoon approaches. What should you do?',
    options: [
      'Stay home since your house has survived previous typhoons without damage',
      'Evacuate to the designated evacuation center as instructed, even if the weather still looks calm',
      'Wait until conditions visibly worsen before deciding',
      'Evacuate only if you personally judge the storm to be dangerous enough',
    ],
    correctIndex: 1,
  },
  {
    id: 'post-ty2',
    category: 'Typhoon',
    module: 'Typhoon',
    question: 'After a typhoon passes, you see a downed power line near your street. What is the correct action?',
    options: [
      'Move it carefully to the side of the road so vehicles can pass',
      'Assume it may still be live, stay away, and report it to the authorities immediately',
      'It’s safe to touch as long as it looks undamaged',
      'Only avoid it if it is visibly sparking',
    ],
    correctIndex: 1,
  },
  {
    id: 'post-fl1',
    category: 'Flood',
    module: 'Flood',
    question: 'You need to evacuate on foot and the only route crosses moving floodwater that looks shallow. What is the safest approach?',
    options: [
      'Walk quickly through the fastest-looking path to minimize exposure time',
      'Avoid the water if at all possible; if you must cross, use a stick to check depth and never cross water above your knees',
      'It’s safe to wade through as long as it doesn’t reach your waist',
      'Hold hands with others in a line and walk through together for stability',
    ],
    correctIndex: 1,
  },
  {
    id: 'post-gen1',
    category: 'General Preparedness',
    module: 'General',
    question: 'Based on what you practiced in LIG+AS, which best describes an effective household disaster plan?',
    options: [
      'A plan that only covers what to do during the disaster itself',
      'A plan covering prevention, response during the event, AND recovery afterward, practiced regularly by the whole household',
      'A plan that is created once and never needs to be updated',
      'A plan that only one family member needs to know in detail',
    ],
    correctIndex: 1,
  },
];

const QUESTION_SETS = { pre: PRE_QUESTIONS, post: POST_QUESTIONS };

const DISASTER_MODULES = ['Earthquake', 'Typhoon', 'Flood', 'General'];

const CONFIDENCE_QUESTION =
  'On a scale of 1 to 5, how confident are you in your ability to respond to a disaster (earthquake, typhoon, or flood)?';

const CONFIDENCE_LABELS = [
  'Not at all confident',
  'Slightly confident',
  'Moderately confident',
  'Very confident',
  'Extremely confident',
];

const TABS = [
  { key: 'pre', label: 'Pre-Assessment' },
  { key: 'post', label: 'Post-Assessment' },
  { key: 'results', label: 'Results' },
];

// ---------------------------------------------------------------------------
// Local (per-browser) results cache.
// RLS on `assessments` only grants admins SELECT access (see the SQL
// migration), so this page cannot query past submissions back from
// Supabase for an anonymous player. Instead, each successful submission is
// mirrored into sessionStorage so the "Results" tab can show a same-device
// Pre vs. Post comparison right after someone plays. Aggregate results
// across all participants belong on an authenticated admin page.
// ---------------------------------------------------------------------------
const STORAGE_KEY = 'ligtas_assessment_results';

function loadLocalResults() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { participantId: '', pre: null, post: null };
  } catch {
    return { participantId: '', pre: null, post: null };
  }
}

function saveLocalResult(participantId, payload) {
  try {
    const current = loadLocalResults();
    const next = current.participantId === participantId ? current : { participantId, pre: null, post: null };
    next[payload.type] = payload;
    next.participantId = participantId;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch (err) {
    console.warn('Could not persist local assessment result:', err.message);
    return null;
  }
}

function percentOf(score, total) {
  if (!total) return 0;
  return Math.round((score / total) * 100);
}

function getFeedback(percent) {
  if (percent >= 80) {
    return { label: 'Excellent!', message: 'You have a strong understanding of disaster preparedness. Keep it up!' };
  }
  if (percent >= 50) {
    return { label: 'Good effort!', message: 'You know the basics — a bit more practice will make you even more prepared.' };
  }
  return { label: 'Keep learning!', message: 'This is a great starting point. Dive into LIG+AS to strengthen your disaster readiness skills.' };
}

export default function Assessment() {
  const [mode, setMode] = useState('pre'); // 'pre' | 'post' | 'results'
  const [participantId, setParticipantId] = useState('');
  const [answers, setAnswers] = useState({}); // { [questionId]: optionIndex }
  const [confidence, setConfidence] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { type, score, total, confidence, submittedAt }
  const [localResults, setLocalResults] = useState(() => loadLocalResults());
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }

  useEffect(() => {
    trackPageVisit('assessment');
    const cached = loadLocalResults();
    if (cached.participantId) setParticipantId(cached.participantId);
  }, []);

  // 'results' mode doesn't render a question form, so falling back to
  // PRE_QUESTIONS there is inert — only 'pre' and 'post' actually use this.
  const activeQuestions = QUESTION_SETS[mode] || PRE_QUESTIONS;

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === activeQuestions.length;

  function handleModeChange(nextMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    setResult(null);
    setAnswers({});
    setConfidence(0);
    setError(null);
  }

  function selectAnswer(questionId, optionIndex) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  function resetForm() {
    setResult(null);
    setAnswers({});
    setConfidence(0);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!participantId.trim()) {
      setError('Please enter your Student ID, email, or full name.');
      return;
    }
    if (!allAnswered) {
      setError('Please answer every question before submitting.');
      return;
    }
    if (!confidence) {
      setError('Please rate your confidence level.');
      return;
    }
    if (!supabase) {
      setError('Backend not configured.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const trimmedId = participantId.trim();
    const assessmentType = mode === 'pre' ? 'pre-assessment' : 'post-assessment';
    const overallScore = activeQuestions.reduce((sum, q) => sum + (answers[q.id] === q.correctIndex ? 1 : 0), 0);

    try {
      // --- Supabase insert ---------------------------------------------------
      // One row per disaster module (not one row for the whole assessment):
      // this is what makes `disaster_module` a queryable column for the admin
      // panel's per-module pass-rate breakdown, instead of a value baked into
      // JSONB. All rows from this submit share identifier/assessment_type and
      // an identical `created_at` (Postgres evaluates now() once per
      // statement), so the admin UI can regroup them into one "attempt".
      const rows = DISASTER_MODULES.map((moduleName) => {
        const moduleQuestions = activeQuestions.filter((q) => q.module === moduleName);
        const moduleScore = moduleQuestions.reduce((sum, q) => sum + (answers[q.id] === q.correctIndex ? 1 : 0), 0);
        const answersPayload = moduleQuestions.map((q) => ({
          questionId: q.id,
          question: q.question,
          selectedIndex: answers[q.id],
          selectedText: q.options[answers[q.id]],
          correctIndex: q.correctIndex,
          isCorrect: answers[q.id] === q.correctIndex,
        }));
        return {
          identifier: trimmedId,
          assessment_type: assessmentType,
          disaster_module: moduleName,
          score: moduleScore,
          total_questions: moduleQuestions.length,
          answers_payload: answersPayload,
          likert_preparedness_rating: confidence,
        };
      });

      const { error: insertError } = await supabase.from('assessment_results').insert(rows);
      if (insertError) throw insertError;
      // ------------------------------------------------------------------------

      logSystemEvent('assessment.submitted', { type: assessmentType, score: overallScore, total: activeQuestions.length }, 'assessment_results', trimmedId);

      const payload = {
        type: mode,
        score: overallScore,
        total: activeQuestions.length,
        confidence,
        submittedAt: new Date().toISOString(),
      };
      const nextLocal = saveLocalResult(trimmedId, payload);
      if (nextLocal) setLocalResults(nextLocal);
      setResult(payload);
      setToast({ type: 'success', message: 'Assessment submitted successfully!' });
    } catch (err) {
      console.error('Failed to submit assessment:', err.message);
      setError('Failed to submit your assessment. Please try again.');
      setToast({ type: 'error', message: 'Failed to submit your assessment. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO */}
      <section className="relative bg-[#0a1120] text-white py-20 sm:py-28 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a1120]"></div>
        <div className="absolute inset-0 bg-orange-500/5" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)' }}></div>

        <div className="relative z-10 px-4 sm:px-8 lg:px-[6%] text-center">
          <div className="inline-block px-4 py-1.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            Knowledge Check
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-tight">
            Disaster Preparedness <span className="text-orange-500">Assessment</span>
          </h1>
          <p className="mt-6 text-base sm:text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Take the Pre-Assessment before you play, then come back for the Post-Assessment
            afterward to see how much you've learned.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="px-4 sm:px-6 lg:px-[4%] max-w-6xl mx-auto">
          {/* Sub-nav tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex flex-wrap justify-center gap-1.5 bg-slate-100 rounded-2xl p-1.5">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleModeChange(tab.key)}
                  className={`px-5 sm:px-7 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wide transition-all ${
                    mode === tab.key
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {mode === 'results' ? (
            <ResultsView localResults={localResults} onStart={() => handleModeChange('pre')} />
          ) : result ? (
            <ThankYouView
              result={result}
              localResults={localResults}
              onRetake={resetForm}
              onGoToPost={() => handleModeChange('post')}
              onGoToResults={() => handleModeChange('results')}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Participant identification */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Student ID, Email, or Full Name *
                </label>
                <p className="text-gray-400 text-xs font-bold mb-3">
                  Used to link your Pre- and Post-Assessment results together.
                </p>
                <input
                  type="text"
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  placeholder="e.g. 2023-00123 or juan.delacruz@email.com"
                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-orange-500 transition-all"
                  required
                />
              </div>

              {/* Progress */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {answeredCount} of {activeQuestions.length} answered
                </span>
                <div className="w-32 sm:w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all duration-300"
                    style={{ width: `${(answeredCount / activeQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* MCQ cards */}
              {activeQuestions.map((q, idx) => (
                <div key={q.id} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-black text-orange-500 uppercase tracking-widest">{q.category}</span>
                    <span className="text-xs font-bold text-gray-300">
                      Question {idx + 1} of {activeQuestions.length}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 mb-5">{q.question}</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const selected = answers[q.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => selectAnswer(q.id, optIdx)}
                          className={`flex items-start gap-3 text-left p-4 rounded-xl border transition-all ${
                            selected
                              ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20'
                              : 'bg-slate-50 border-slate-100 hover:border-orange-200'
                          }`}
                        >
                          <span
                            className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                              selected ? 'bg-orange-500 text-white' : 'bg-white text-slate-400 border border-slate-200'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className={`text-sm font-bold ${selected ? 'text-slate-800' : 'text-slate-600'}`}>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Likert confidence scale */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-black text-orange-500 uppercase tracking-widest">Self-Evaluation</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 mb-5">{CONFIDENCE_QUESTION}</h3>
                <div className="flex flex-wrap gap-3">
                  {CONFIDENCE_LABELS.map((label, i) => {
                    const value = i + 1;
                    const selected = confidence === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setConfidence(value)}
                        className={`flex-1 min-w-[92px] flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                          selected
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-orange-200'
                        }`}
                      >
                        <span className="text-xl font-black">{value}</span>
                        <span className="text-[11px] font-bold text-center leading-tight">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-wide transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <ClipboardCheck size={18} />}
                {submitting ? 'Submitting...' : `Submit ${mode === 'pre' ? 'Pre' : 'Post'}-Assessment`}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}

function ThankYouView({ result, localResults, onRetake, onGoToPost, onGoToResults }) {
  const percent = percentOf(result.score, result.total);
  const feedback = getFeedback(percent);
  const confidenceLabel = CONFIDENCE_LABELS[result.confidence - 1];

  const priorPre = result.type === 'post' ? localResults?.pre : null;
  const delta = priorPre ? percent - percentOf(priorPre.score, priorPre.total) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center shadow-sm">
      <CheckCircle2 className="text-green-500 mx-auto mb-4" size={48} />
      <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
        {result.type === 'pre' ? 'Pre-Assessment' : 'Post-Assessment'} Complete!
      </h2>
      <p className="text-gray-500 text-sm font-bold mb-8">Your response has been recorded. Thank you!</p>

      <div className="inline-flex flex-col items-center bg-slate-50 rounded-2xl px-10 py-6 mb-6">
        <span className="text-5xl font-black text-orange-500">{percent}%</span>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
          {result.score} / {result.total} correct
        </span>
      </div>

      <p className="text-lg font-black text-slate-800 mb-1">{feedback.label}</p>
      <p className="text-gray-500 text-sm font-medium max-w-md mx-auto mb-6">{feedback.message}</p>

      <div className="inline-block bg-orange-50 text-orange-600 text-xs font-black uppercase tracking-wide px-4 py-2 rounded-full mb-8">
        Self-rated confidence: {result.confidence}/5 — {confidenceLabel}
      </div>

      {delta !== null && (
        <div
          className={`mb-8 p-4 rounded-xl text-sm font-bold ${
            delta > 0 ? 'bg-green-50 text-green-600' : delta < 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
          }`}
        >
          {delta > 0 && `You improved by ${delta} percentage points since your Pre-Assessment! 🎉`}
          {delta < 0 && `Your score changed by ${delta} percentage points since your Pre-Assessment.`}
          {delta === 0 && 'Your score is the same as your Pre-Assessment.'}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        {result.type === 'pre' ? (
          <button
            onClick={onGoToPost}
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-200"
          >
            Play LIG+AS, then take the Post-Assessment <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={onGoToResults}
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-200"
          >
            <BarChart3 size={16} /> View Results
          </button>
        )}
        <button
          onClick={onRetake}
          className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-bold text-sm transition-all"
        >
          <RotateCcw size={16} /> Retake this assessment
        </button>
      </div>
    </div>
  );
}

function ResultsView({ localResults, onStart }) {
  const { pre, post } = localResults || {};

  const cards = useMemo(
    () => [
      { key: 'pre', label: 'Pre-Assessment', data: pre },
      { key: 'post', label: 'Post-Assessment', data: post },
    ],
    [pre, post]
  );

  if (!pre && !post) {
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
          Start Pre-Assessment <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  const prePercent = pre ? percentOf(pre.score, pre.total) : null;
  const postPercent = post ? percentOf(post.score, post.total) : null;
  const delta = prePercent !== null && postPercent !== null ? postPercent - prePercent : null;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-5">
        {cards.map(({ key, label, data }) => (
          <div key={key} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <span className="text-xs font-black text-orange-500 uppercase tracking-widest">{label}</span>
            {data ? (
              <>
                <div className="mt-3 text-4xl font-black text-slate-800">{percentOf(data.score, data.total)}%</div>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  {data.score} / {data.total} correct &middot; Confidence {data.confidence}/5
                </p>
                <p className="text-[11px] font-bold text-gray-300 mt-3">
                  Submitted {new Date(data.submittedAt).toLocaleString()}
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm font-bold text-gray-400">Not completed yet.</p>
            )}
          </div>
        ))}
      </div>

      {delta !== null && (
        <div
          className={`p-5 rounded-2xl text-center font-black text-sm ${
            delta > 0 ? 'bg-green-50 text-green-600' : delta < 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
          }`}
        >
          {delta > 0 && `Great progress! Your score improved by ${delta} percentage points after playing LIG+AS. 🎉`}
          {delta < 0 && `Your score changed by ${delta} percentage points between assessments.`}
          {delta === 0 && 'Your Pre- and Post-Assessment scores are the same.'}
        </div>
      )}

      <p className="text-center text-xs font-bold text-gray-400">
        Results shown here are limited to this device/browser session. Administrators can review aggregate results across
        all participants from the admin dashboard.
      </p>
    </div>
  );
}
