import { Award } from 'lucide-react';
import { formatDuration } from '../../lib/assessmentScoring';

/**
 * Summary report certificate. Visible on screen as a preview and the only
 * thing left when the page is printed (FinalResultsDashboard hides the rest
 * with `print:hidden`, and index.css hides the site navbar/footer in print).
 * `print-color-adjust: exact` keeps the tinted areas from being dropped by
 * "save ink" print settings.
 */
export default function SessionCertificate({ name, category, rating, gameCode, completedAt, prePercent, postPercent, gain, game }) {
  const dateText = completedAt
    ? new Date(completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <section
      aria-label="Certificate"
      className="bg-white rounded-[2rem] border-4 border-double border-orange-300 p-8 sm:p-12 text-center shadow-sm print:shadow-none print:rounded-none [print-color-adjust:exact] [-webkit-print-color-adjust:exact]"
    >
      <Award className="text-orange-500 mx-auto mb-3" size={44} />
      <p className="text-xs font-black text-orange-500 uppercase tracking-[0.3em] mb-2">LIG+AS Disaster Preparedness Simulation</p>
      <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mb-6">Certificate of Completion</h2>

      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">This certifies that</p>
      <p className="text-2xl sm:text-3xl font-black text-slate-800 border-b-2 border-slate-200 inline-block px-8 pb-1 mb-4 min-w-[14rem]">
        {name || 'Participant'}
      </p>
      <p className="text-sm sm:text-base font-medium text-slate-500 max-w-lg mx-auto mb-6">
        completed the <span className="font-black text-slate-700">{category.label}</span> module — Pre-Test, mobile game scenario, and Post-Test — and earned the rating
      </p>

      <p className="text-xl sm:text-2xl font-black text-orange-500 mb-8">{rating.title}</p>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8 text-left">
        <Fact label="Pre-Test" value={prePercent !== null ? `${prePercent}%` : '—'} />
        <Fact label="Post-Test" value={postPercent !== null ? `${postPercent}%` : '—'} />
        <Fact label="Knowledge Gain" value={gain === null ? '—' : `${gain > 0 ? '+' : ''}${gain}%`} />
        <Fact label="Game Score" value={game ? game.game_score.toLocaleString() : '—'} />
        <Fact label="Completion Time" value={game ? formatDuration(game.completion_time_seconds) : '—'} />
        <Fact label="Hazards Avoided" value={game ? `${game.hazards_avoided} / ${game.hazards_total}` : '—'} />
        <Fact label="Safety Checklist" value={game ? `${game.checklist_completed} / ${game.checklist_total}` : '—'} />
        <Fact label="Overall" value={`${rating.score}/100`} />
      </dl>

      <p className="text-xs font-bold text-slate-400">
        {dateText && <>Completed {dateText} &middot; </>}Game Code {gameCode}
      </p>
    </section>
  );
}

function Fact({ label, value }) {
  return (
    <div className="bg-orange-50/60 rounded-xl px-4 py-3">
      <dt className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</dt>
      <dd className="text-base font-black text-slate-800">{value}</dd>
    </div>
  );
}
