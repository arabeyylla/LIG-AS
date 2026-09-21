import { useState } from 'react';
import { ClipboardCheck, Loader2, AlertCircle } from 'lucide-react';
import { CONFIDENCE_LABELS, confidenceQuestion } from '../../lib/assessmentScoring';
import { sessionErrorMessage } from '../../lib/assessmentSessions';

/**
 * The question sequence for ONE category: (Pre-Test only) participant id, the
 * randomized questions, the confidence (Likert) self-rating, and submit.
 *
 * Owns the per-attempt state (answers, confidence, submit status); the parent
 * renders it with `key={attemptId}` so every new attempt starts clean. It does
 * no networking itself: on submit it scores the answers and awaits
 * `onSubmit({ identifier, score, total, answers, confidence })`, which must
 * resolve the RPC result `{ ok, error?, ... }` (Pre-Test and Post-Test use
 * different RPCs — see lib/assessmentSessions.js). On `ok` it calls
 * `onSubmitted(result)`; otherwise it shows the error and lets the player retry.
 *
 * The Post-Test has no participant field (`showParticipantField` false): the
 * database already knows who the session belongs to.
 */
export default function AssessmentQuiz({
  type,
  category,
  questions,
  participantId,
  onParticipantIdChange,
  showParticipantField = true,
  consentGiven,
  onSubmit,
  onSubmitted,
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
    if (showParticipantField && !trimmedId) return setError('Please enter your Student ID, email, or full name.');
    if (!consentGiven) return setError('Please agree to the data privacy notice before submitting.');
    if (!allAnswered) return setError('Please answer every question before submitting.');
    if (!confidence) return setError('Please rate your confidence level.');

    setSubmitting(true);
    setError(null);

    const isCorrect = (q) => answers[q.id] === q.correctIndex;
    const result = await onSubmit({
      identifier: trimmedId,
      score: questions.filter(isCorrect).length,
      total: questions.length,
      confidence,
      answers: questions.map((q) => ({
        questionId: q.id,
        question: q.question,
        selectedIndex: answers[q.id],
        selectedText: q.options[answers[q.id]],
        correctIndex: q.correctIndex,
        isCorrect: isCorrect(q),
      })),
    });

    if (result.ok) {
      onSubmitted(result); // parent navigates away and unmounts this form
    } else {
      setError(sessionErrorMessage(result.error));
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

      {/* Participant identification (Pre-Test only) */}
      {showParticipantField && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <label htmlFor="participant-id" className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
            Student ID, Email, or Full Name *
          </label>
          <p className="text-gray-400 text-xs font-bold mb-3">Linked to your Game Code so your Pre-Test, game, and Post-Test results stay together.</p>
          <input
            id="participant-id"
            type="text"
            value={participantId}
            onChange={(e) => onParticipantIdChange(e.target.value)}
            placeholder="e.g. 2023-00123 or juan.delacruz@email.com"
            maxLength={200}
            className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-orange-500 transition-all"
            required
          />
        </div>
      )}

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
