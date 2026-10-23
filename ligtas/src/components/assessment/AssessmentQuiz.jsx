import { useState, useRef } from 'react';
import { ClipboardCheck, Loader2, AlertCircle } from 'lucide-react';
import { CONFIDENCE_LABELS, confidenceQuestion } from '../../lib/assessmentScoring';
import { sessionErrorMessage } from '../../lib/assessmentSessions';

const UNANSWERED_ERROR = 'unanswered';

/** "Please answer every question… 3 of 10 still unanswered (Questions 2, 5, 9)." — null once none are left. */
function unansweredMessage(questions, unanswered) {
  if (unanswered.length === 0) return null;
  const numbers = unanswered.map((q) => questions.indexOf(q) + 1);
  const list = numbers.length > 5 ? `${numbers.slice(0, 5).join(', ')} and ${numbers.length - 5} more` : numbers.join(', ');
  return `Please answer every question before submitting. ${unanswered.length} of ${questions.length} still unanswered (Question${numbers.length > 1 ? 's' : ''} ${list}).`;
}

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
  // A message string, or UNANSWERED_ERROR — that one is worded from the live
  // answers (below), so it shrinks as the player fills in the blanks.
  const [error, setError] = useState(null);
  // Set after a submit attempt with blanks, so unanswered items get highlighted.
  const [showMissing, setShowMissing] = useState(false);
  const cardRefs = useRef({}); // { [questionId | 'participant' | 'confidence']: element }

  const unanswered = questions.filter((q) => answers[q.id] === undefined);
  const answeredCount = questions.length - unanswered.length;
  const typeLabel = type === 'pre' ? 'Pre' : 'Post';
  const errorText = error === UNANSWERED_ERROR ? unansweredMessage(questions, unanswered) : error;

  // Brings a blank item into view so the player sees what to fix (the error
  // banner is at the top of a long form, usually off-screen at submit time).
  function focusItem(key) {
    const el = cardRefs.current[key];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.querySelector('input, button')?.focus({ preventScroll: true });
  }

  function fail(message, key) {
    setError(message);
    setShowMissing(true);
    if (key) focusItem(key);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedId = participantId.trim();
    if (showParticipantField && !trimmedId) return fail('Please enter your Student ID, email, or full name.', 'participant');
    if (!consentGiven) return fail('Please agree to the data privacy notice before submitting.');
    if (questions.length === 0) return fail('There are no questions to submit.');
    if (unanswered.length > 0) return fail(UNANSWERED_ERROR, unanswered[0].id);
    if (!confidence) return fail('Please rate your confidence level.', 'confidence');

    setSubmitting(true);
    setError(null);
    setShowMissing(false);

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

  const errorBanner = (announce) => errorText && (
    <div role={announce ? 'alert' : undefined} className="flex items-start gap-2 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl">
      <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
      <span>{errorText}</span>
    </div>
  );
  const missingCard = 'border-red-300 ring-2 ring-red-500/10';

  return (
    // noValidate: every check runs in handleSubmit so all errors look the same
    // and scroll to the item, instead of the browser's own tooltip.
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {errorBanner(true)}

      {/* Participant identification (Pre-Test only) */}
      {showParticipantField && (
        <div
          ref={(el) => { cardRefs.current.participant = el; }}
          className={`bg-white rounded-2xl border p-6 sm:p-8 shadow-sm ${showMissing && !participantId.trim() ? missingCard : 'border-gray-100'}`}
        >
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
            style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* MCQ cards */}
      {questions.map((q, idx) => {
        const missing = showMissing && answers[q.id] === undefined;
        return (
        <div
          key={q.id}
          ref={(el) => { cardRefs.current[q.id] = el; }}
          className={`bg-white rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors ${missing ? missingCard : 'border-gray-100'}`}
        >
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs font-black text-orange-500 uppercase tracking-widest">{category.label}</span>
            <span className="text-xs font-bold text-gray-300">
              Question {idx + 1} of {questions.length}
            </span>
            {missing && <span className="ml-auto text-[11px] font-black text-red-500 uppercase tracking-wider">Not answered yet</span>}
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
        );
      })}

      {/* Likert confidence scale */}
      <div
        ref={(el) => { cardRefs.current.confidence = el; }}
        className={`bg-white rounded-2xl border p-6 sm:p-8 shadow-sm ${showMissing && !confidence ? missingCard : 'border-gray-100'}`}
      >
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

      {/* Repeated next to the button, where the player is looking when they press it. */}
      {errorBanner(false)}
      {!errorText && unanswered.length > 0 && (
        <p className="text-center text-xs font-bold text-slate-400">
          {unanswered.length} question{unanswered.length !== 1 ? 's' : ''} left to answer
        </p>
      )}

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
