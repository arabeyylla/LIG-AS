import { useState } from 'react';
import { ClipboardCheck, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logSystemEvent } from '../../lib/systemLogs';
import { ASSESSMENT_TYPE_BY_MODE } from '../../lib/assessmentQuestionBank';
import { CONFIDENCE_LABELS, confidenceQuestion } from '../../lib/assessmentScoring';

/**
 * The question sequence for ONE category: participant id, the randomized
 * questions, the confidence (Likert) self-rating, and submit.
 *
 * Owns the per-attempt state (answers, confidence, submit status). The parent
 * renders it with `key={attemptId}` so every new attempt starts clean.
 *
 * On submit it inserts exactly ONE row into `assessment_results` with
 * `disaster_module` = the category, which is what the admin Analytics tab
 * groups by to compute per-category Pre vs. Post averages and Knowledge Gain.
 * On success it calls `onSubmitted(payload)`; the parent handles local
 * caching and navigation.
 */
export default function AssessmentQuiz({
  type,
  category,
  questions,
  participantId,
  onParticipantIdChange,
  consentGiven,
  onSubmitted,
  onToast,
}) {
  const [answers, setAnswers] = useState({}); // { [questionId]: optionIndex }
  const [confidence, setConfidence] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const typeLabel = type === 'pre' ? 'Pre' : 'Post';

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedId = participantId.trim();
    if (!trimmedId) return setError('Please enter your Student ID, email, or full name.');
    if (!consentGiven) return setError('Please agree to the data privacy notice before submitting.');
    if (!allAnswered) return setError('Please answer every question before submitting.');
    if (!confidence) return setError('Please rate your confidence level.');
    if (!supabase) return setError('Backend not configured.');

    setSubmitting(true);
    setError(null);

    const assessmentType = ASSESSMENT_TYPE_BY_MODE[type];
    const isCorrect = (q) => answers[q.id] === q.correctIndex;
    const score = questions.filter(isCorrect).length;

    try {
      // --- Supabase insert ---------------------------------------------------
      // One row per attempt. `disaster_module` holds the category id, so
      // per-category analytics is a GROUP BY over (disaster_module,
      // assessment_type) — see components/admin/AssessmentAnalytics.jsx.
      const { error: insertError } = await supabase.from('assessment_results').insert({
        identifier: trimmedId,
        assessment_type: assessmentType,
        disaster_module: category.id,
        score,
        total_questions: questions.length,
        answers_payload: questions.map((q) => ({
          questionId: q.id,
          question: q.question,
          selectedIndex: answers[q.id],
          selectedText: q.options[answers[q.id]],
          correctIndex: q.correctIndex,
          isCorrect: isCorrect(q),
        })),
        likert_preparedness_rating: confidence,
      });
      if (insertError) throw insertError;
      // ------------------------------------------------------------------------

      logSystemEvent(
        'assessment.submitted',
        { type: assessmentType, category: category.id, score, total: questions.length },
        'assessment_results',
        trimmedId
      );
      onToast('success', 'Assessment submitted successfully!');
      onSubmitted({ type, category: category.id, score, total: questions.length, confidence, submittedAt: new Date().toISOString() });
    } catch (err) {
      console.error('Failed to submit assessment:', err.message);
      setError('Failed to submit your assessment. Please try again.');
      onToast('error', 'Failed to submit your assessment. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Participant identification */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <label htmlFor="participant-id" className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
          Student ID, Email, or Full Name *
        </label>
        <p className="text-gray-400 text-xs font-bold mb-3">Used to link your Pre- and Post-Assessment results together.</p>
        <input
          id="participant-id"
          type="text"
          value={participantId}
          onChange={(e) => onParticipantIdChange(e.target.value)}
          placeholder="e.g. 2023-00123 or juan.delacruz@email.com"
          className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-orange-500 transition-all"
          required
        />
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          {answeredCount} of {questions.length} answered
        </span>
        <div className="w-32 sm:w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* MCQ cards */}
      {questions.map((q, idx) => (
        <div key={q.id} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-black text-orange-500 uppercase tracking-widest">{category.label}</span>
            <span className="text-xs font-bold text-gray-300">
              Question {idx + 1} of {questions.length}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-800 mb-5">{q.question}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {q.options.map((opt, optIdx) => {
              const selected = answers[q.id] === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                  className={`flex items-start gap-3 text-left p-4 rounded-xl border transition-all ${
                    selected ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20' : 'bg-slate-50 border-slate-100 hover:border-orange-200'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                      selected ? 'bg-orange-500 text-white' : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
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
        <span className="block text-xs font-black text-orange-500 uppercase tracking-widest mb-3">Self-Evaluation</span>
        <h3 className="text-base sm:text-lg font-black text-slate-800 mb-5">{confidenceQuestion(category)}</h3>
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
                  selected ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-orange-200'
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
        {submitting ? 'Submitting...' : `Submit ${typeLabel}-Assessment`}
      </button>
    </form>
  );
}
