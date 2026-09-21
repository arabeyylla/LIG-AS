import { useState } from 'react';
import { ClipboardList, KeyRound, ArrowRight, Loader2, AlertCircle, Smartphone, ClipboardCheck } from 'lucide-react';
import { normalizeGameCode, isCompleteGameCode, sessionErrorMessage, GAME_CODE_LENGTH } from '../../lib/assessmentSessions';

const FLOW_STEPS = [
  { icon: ClipboardList, label: 'Take the Pre-Test', hint: 'Pick a module and get your Game Code' },
  { icon: Smartphone, label: 'Play in the mobile app', hint: 'Enter the code in LIG+AS' },
  { icon: ClipboardCheck, label: 'Post-Test & results', hint: 'Unlocks after you finish the game' },
];

/**
 * First screen of the Assessment tab. Two ways in:
 *   - start a new session with the Pre-Test, or
 *   - resume an existing one by entering its Game Code (e.g. after closing or
 *     refreshing the page, or to open the Post-Test / final results).
 *
 * `onResume(code)` must resolve `{ ok, error }`; on success the parent
 * navigates away, on failure the error is shown under the input.
 */
export default function AssessmentHome({ onStartPreTest, onResume, initialCode = '' }) {
  return (
    <div>
      <ol className="grid sm:grid-cols-3 gap-3 mb-10">
        {FLOW_STEPS.map(({ icon, label, hint }, i) => {
          const StepIcon = icon;
          return (
            <li key={label} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
              <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-white text-orange-500 border border-slate-100 flex items-center justify-center">
                <StepIcon size={17} />
              </span>
              <span>
                <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest">Step {i + 1}</span>
                <span className="block text-sm font-black text-slate-700">{label}</span>
                <span className="block text-xs font-bold text-slate-400 mt-0.5">{hint}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="grid md:grid-cols-2 gap-5">
        <button
          type="button"
          onClick={onStartPreTest}
          className="group text-left bg-white rounded-[2rem] border-2 border-slate-100 hover:border-orange-400 p-8 shadow-sm hover:shadow-xl hover:shadow-orange-100 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/30"
        >
          <div className="w-14 h-14 mb-6 rounded-2xl bg-blue-100 text-blue-500 flex items-center justify-center">
            <ClipboardList size={26} />
          </div>
          <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1">New here?</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Start Pre-Test</h3>
          <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
            Choose a disaster module and measure your baseline knowledge. You'll get a Game Code to play the matching scenario in the mobile app.
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-black text-orange-500 group-hover:gap-3 transition-all">
            Choose a module <ArrowRight size={16} />
          </span>
        </button>

        <ResumeCodeForm onResume={onResume} initialCode={initialCode} />
      </div>
    </div>
  );
}

function ResumeCodeForm({ onResume, initialCode }) {
  const [code, setCode] = useState(normalizeGameCode(initialCode));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isCompleteGameCode(code)) {
      setError(`A Game Code has ${GAME_CODE_LENGTH} characters.`);
      return;
    }
    setBusy(true);
    setError(null);
    const result = await onResume(code);
    if (!result.ok) {
      setError(sessionErrorMessage(result.error));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-sm">
      <div className="w-14 h-14 mb-6 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center">
        <KeyRound size={26} />
      </div>
      <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1">Already have a code?</p>
      <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Resume / Enter Code</h3>
      <p className="text-sm font-medium text-slate-500 leading-relaxed mb-5">
        Closed the page or finished the game? Enter your Game Code to see your progress, take the Post-Test, or view your results.
      </p>

      <label htmlFor="resume-game-code" className="sr-only">Game Code</label>
      <input
        id="resume-game-code"
        type="text"
        value={code}
        onChange={(e) => { setCode(normalizeGameCode(e.target.value)); setError(null); }}
        placeholder="ABC123"
        maxLength={GAME_CODE_LENGTH}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        aria-invalid={Boolean(error)}
        className="w-full p-4 bg-slate-50 border-2 border-slate-100 focus:border-orange-500 rounded-xl text-center text-2xl font-black tracking-[0.4em] text-slate-800 placeholder:text-slate-300 placeholder:tracking-[0.4em] outline-none transition-all"
      />

      {error && (
        <p role="alert" className="flex items-start gap-2 mt-3 text-sm font-bold text-red-600">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /> {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !isCompleteGameCode(code)}
        className="w-full mt-4 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-wide transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        {busy ? 'Checking...' : 'Continue'}
      </button>
    </form>
  );
}
