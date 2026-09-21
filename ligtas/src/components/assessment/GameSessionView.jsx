import { useState } from 'react';
import { Loader2, AlertCircle, Check, Copy, RefreshCw, Unlock, Smartphone, Hourglass, ArrowRight, PartyPopper } from 'lucide-react';
import { useGameSession } from '../../hooks/useGameSession';
import { SESSION_STATUS, sessionErrorMessage } from '../../lib/assessmentSessions';
import { getCategory } from '../../lib/assessmentCategories';
import { percentOf, formatDuration } from '../../lib/assessmentScoring';
import FinalResultsDashboard from './FinalResultsDashboard';

/**
 * Everything the player sees for one Game Code, driven by the session status:
 *
 *   waiting_for_game -> the code + instructions; auto-checks until the Unity app uploads
 *   completed_game   -> Post-Test unlocked
 *   post_completed   -> Final Results & Game Evaluation dashboard
 *   expired          -> the code ran out before it was played
 *
 * Status comes from `useGameSession`, which polls the `get_session` RPC, so
 * the unlock happens automatically without the player refreshing.
 */
export default function GameSessionView({ gameCode, participantName, onStartPostTest, onNewSession, onChangeCode }) {
  const { session, error, loading, refresh } = useGameSession(gameCode);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20 text-slate-400 gap-4">
        <Loader2 className="animate-spin" size={36} />
        <p className="font-bold text-sm">Loading your session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <Card>
        <AlertCircle className="text-orange-300 mx-auto mb-4" size={40} />
        <h3 className="text-lg font-black text-slate-800 mb-1">Couldn't load this session</h3>
        <p className="text-sm font-medium text-gray-500 mb-6">{sessionErrorMessage(error)}</p>
        <div className="flex justify-center gap-3">
          {error !== 'invalid_code' && <PrimaryButton onClick={refresh}><RefreshCw size={16} /> Try again</PrimaryButton>}
          <SecondaryButton onClick={onChangeCode}>Enter a different code</SecondaryButton>
        </div>
      </Card>
    );
  }

  if (session.status === SESSION_STATUS.POST_DONE) {
    return <FinalResultsDashboard session={session} participantName={participantName} onNewSession={onNewSession} />;
  }

  const category = getCategory(session.module);

  return (
    <div className="space-y-6">
      <SessionStepper status={session.status} />

      {session.status === SESSION_STATUS.WAITING && <GameCodeCard session={session} category={category} onRefresh={refresh} networkError={error === 'network'} />}
      {session.status === SESSION_STATUS.GAME_DONE && <PostTestUnlocked session={session} category={category} onStart={() => onStartPostTest(session)} />}
      {session.status === SESSION_STATUS.EXPIRED && (
        <Card>
          <Hourglass className="text-orange-300 mx-auto mb-4" size={40} />
          <h3 className="text-lg font-black text-slate-800 mb-1">This Game Code has expired</h3>
          <p className="text-sm font-medium text-gray-500 mb-6 max-w-md mx-auto">
            Game Codes are valid for 2 days. Take the Pre-Test again to get a fresh code for {category.label}.
          </p>
          <PrimaryButton onClick={onNewSession}>Start a new Pre-Test <ArrowRight size={16} /></PrimaryButton>
        </Card>
      )}
    </div>
  );
}

// --- Progress stepper -----------------------------------------------------------

function SessionStepper({ status }) {
  const game = status === SESSION_STATUS.WAITING ? 'current' : status === SESSION_STATUS.EXPIRED ? 'todo' : 'done';
  const post = status === SESSION_STATUS.GAME_DONE ? 'current' : 'todo';
  const steps = [
    { label: 'Pre-Test', state: 'done' },
    { label: 'Play the game', state: game },
    { label: 'Post-Test', state: post },
  ];
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-4" aria-label="Session progress">
      {steps.map((step, i) => (
        <li key={step.label} className="flex items-center gap-2 sm:gap-4">
          <span className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                step.state === 'done' ? 'bg-green-500 text-white' : step.state === 'current' ? 'bg-orange-500 text-white ring-4 ring-orange-100' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step.state === 'done' ? <Check size={14} /> : i + 1}
            </span>
            <span className={`text-xs sm:text-sm font-black ${step.state === 'todo' ? 'text-slate-300' : 'text-slate-700'}`}>{step.label}</span>
          </span>
          {i < steps.length - 1 && <span className="w-6 sm:w-12 h-0.5 bg-slate-100" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

// --- Step 2: show the code ------------------------------------------------------

function GameCodeCard({ session, category, onRefresh, networkError }) {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(session.game_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable (insecure context / denied) — the code is on screen to read out */
    }
  }

  async function checkNow() {
    setChecking(true);
    await onRefresh();
    setChecking(false);
  }

  const preScore = session.pre ? `${session.pre.score}/${session.pre.total}` : null;

  return (
    <Card>
      <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-2">
        <span aria-hidden="true">{category.emoji}</span> {category.label} &middot; Pre-Test complete{preScore ? ` (${preScore})` : ''}
      </p>
      <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">Your Game Code</h2>
      <p className="text-gray-500 text-sm font-medium max-w-md mx-auto mb-6">
        Open the LIG+AS mobile app and enter this Game Code to play the scenario.
      </p>

      <div className="flex justify-center gap-2 sm:gap-3 mb-5" aria-label={`Game code ${session.game_code.split('').join(' ')}`}>
        {session.game_code.split('').map((char, i) => (
          <span key={i} className="w-11 h-14 sm:w-14 sm:h-16 flex items-center justify-center bg-slate-50 border-2 border-slate-100 rounded-xl text-2xl sm:text-4xl font-black text-slate-800">
            {char}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={copyCode}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black transition-all mb-6"
      >
        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
        {copied ? 'Copied!' : 'Copy code'}
      </button>

      <div className="max-w-md mx-auto text-left bg-slate-50 rounded-2xl p-5 mb-6 space-y-2">
        <p className="flex items-start gap-2 text-sm font-bold text-slate-600">
          <Smartphone size={16} className="flex-shrink-0 mt-0.5 text-orange-500" />
          Enter the code in the app and play the {category.label} scenario.
        </p>
        <p className="text-xs font-bold text-slate-400 pl-6">
          Valid until {new Date(session.expires_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}.
          If you close this page, come back to the Assessment tab and use <span className="text-slate-600">Resume / Enter Code</span>.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="inline-flex items-center gap-2 text-sm font-black text-slate-500">
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
          </span>
          Waiting for you to finish the game — the Post-Test unlocks automatically.
        </p>
        {networkError && <p className="text-xs font-bold text-amber-600">Having trouble reaching the server — still trying.</p>}
        <button type="button" onClick={checkNow} disabled={checking} className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-wider disabled:opacity-50">
          <RefreshCw size={13} className={checking ? 'animate-spin' : ''} /> Check now
        </button>
      </div>
    </Card>
  );
}

// --- Step 3: Post-Test unlocked ------------------------------------------------

function PostTestUnlocked({ session, category, onStart }) {
  const game = session.game;
  const hazards = game ? percentOf(game.hazards_avoided, game.hazards_total) : null;
  return (
    <Card>
      <PartyPopper className="text-orange-500 mx-auto mb-4" size={44} />
      <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-2 inline-flex items-center gap-1.5">
        <Unlock size={13} /> Post-Test unlocked
      </p>
      <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
        <span aria-hidden="true">{category.emoji}</span> Scenario complete!
      </h2>
      <p className="text-gray-500 text-sm font-medium max-w-md mx-auto mb-6">
        Your {category.label} game results were received. Take the Post-Test to see how much you've learned and get your final report.
      </p>

      {game && (
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Chip label="Game score" value={game.game_score.toLocaleString()} />
          <Chip label="Time" value={formatDuration(game.completion_time_seconds)} />
          {hazards !== null && <Chip label="Hazards avoided" value={`${game.hazards_avoided}/${game.hazards_total}`} />}
        </div>
      )}

      <PrimaryButton onClick={onStart}>Start Post-Test <ArrowRight size={16} /></PrimaryButton>
    </Card>
  );
}

// --- Small shared pieces --------------------------------------------------------

function Card({ children }) {
  return <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center shadow-sm">{children}</div>;
}

function Chip({ label, value }) {
  return (
    <span className="bg-slate-50 rounded-xl px-4 py-2.5 text-left">
      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="block text-sm font-black text-slate-800">{value}</span>
    </span>
  );
}

function PrimaryButton({ onClick, children }) {
  return (
    <button onClick={onClick} className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-7 py-3.5 rounded-xl font-black text-sm uppercase tracking-wide transition-all shadow-lg shadow-orange-200">
      {children}
    </button>
  );
}

function SecondaryButton({ onClick, children }) {
  return (
    <button onClick={onClick} className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-bold text-sm transition-all">
      {children}
    </button>
  );
}
