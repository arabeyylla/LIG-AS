import { useState } from 'react';
import { Award, Trophy, Timer, ShieldCheck, ListChecks, Printer, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { getCategory } from '../../lib/assessmentCategories';
import { percentOf, knowledgeGain, formatDuration, getPerformanceRating } from '../../lib/assessmentScoring';
import SessionCertificate from './SessionCertificate';

/**
 * Final Results & Game Evaluation Summary, shown once the Post-Test is in.
 * Everything comes from one `get_session` payload:
 *   - Pre-Test vs. Post-Test score and Knowledge Gain
 *   - the mobile game's evaluation (score, time, hazards, checklist)
 *   - an overall performance rating
 *   - a printable certificate (the browser's Print dialog also offers "Save as PDF")
 *
 * When printing, the dashboard cards are hidden (`print:hidden`) and only the
 * certificate — which repeats the key numbers — is output.
 */
export default function FinalResultsDashboard({ session, participantName = '', onNewSession }) {
  const category = getCategory(session.module);
  const { pre, post, game } = session;

  const prePercent = pre ? percentOf(pre.score, pre.total) : null;
  const postPercent = post ? percentOf(post.score, post.total) : null;
  const gain = knowledgeGain(prePercent, postPercent);
  const hazardsPercent = game ? percentOf(game.hazards_avoided, game.hazards_total) : null;
  const checklistPercent = game ? percentOf(game.checklist_completed, game.checklist_total) : null;
  const rating = getPerformanceRating({ postPercent, hazardsPercent, checklistPercent });

  const [certificateName, setCertificateName] = useState(participantName);

  return (
    <div className="space-y-6">
      <div className="print:hidden space-y-6">
        {/* Rating */}
        <div className="bg-[#0a1120] text-white rounded-[2rem] p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-orange-500/10" aria-hidden="true" />
          <div className="relative">
            <p className="text-xs font-black text-orange-400 uppercase tracking-widest mb-4">
              <span aria-hidden="true">{category.emoji}</span> {category.label} &middot; Final Results
            </p>
            <Award className="text-orange-400 mx-auto mb-3" size={48} />
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">{rating.title}</h2>
            <p className="text-gray-400 text-sm sm:text-base font-medium max-w-lg mx-auto">{rating.message}</p>
            <p className="mt-4 inline-block px-4 py-1.5 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest text-gray-300">
              Overall performance {rating.score}/100
            </p>
          </div>
        </div>

        {/* Pre vs. Post + Knowledge Gain */}
        <div className="grid sm:grid-cols-3 gap-5">
          <ScoreCard label="Pre-Test" data={pre} percent={prePercent} />
          <ScoreCard label="Post-Test" data={post} percent={postPercent} accent />
          <GainCard gain={gain} prePercent={prePercent} postPercent={postPercent} />
        </div>

        {/* Mobile game evaluation */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
          <h3 className="font-black text-slate-800 text-lg mb-5">Mobile Game Performance</h3>
          {game ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <GameTile icon={Trophy} label="Game Score" value={game.game_score.toLocaleString()} />
              <GameTile icon={Timer} label="Completion Time" value={formatDuration(game.completion_time_seconds)} />
              <GameTile icon={ShieldCheck} label="Hazards Avoided" value={`${game.hazards_avoided} / ${game.hazards_total}`} percent={hazardsPercent} />
              <GameTile icon={ListChecks} label="Safety Checklist" value={`${game.checklist_completed} / ${game.checklist_total}`} percent={checklistPercent} />
            </div>
          ) : (
            <p className="text-sm font-bold text-slate-400">No game data was recorded for this session.</p>
          )}
        </div>

        {/* Certificate controls */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
          <h3 className="font-black text-slate-800 text-lg mb-1">Summary Report Certificate</h3>
          <p className="text-sm font-medium text-slate-400 mb-5">
            Print your certificate, or choose "Save as PDF" in the print dialog to download it.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <label htmlFor="certificate-name" className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Name on certificate</label>
              <input
                id="certificate-name"
                type="text"
                value={certificateName}
                onChange={(e) => setCertificateName(e.target.value)}
                placeholder="Your name"
                maxLength={80}
                className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-orange-500 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-7 py-3.5 rounded-xl font-black text-sm uppercase tracking-wide transition-all shadow-lg shadow-orange-200"
            >
              <Printer size={16} /> Print / Save as PDF
            </button>
          </div>
        </div>
      </div>

      <SessionCertificate
        name={certificateName.trim()}
        category={category}
        rating={rating}
        gameCode={session.game_code}
        completedAt={session.post_completed_at}
        prePercent={prePercent}
        postPercent={postPercent}
        gain={gain}
        game={game}
      />

      <div className="print:hidden text-center">
        <button onClick={onNewSession} className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-bold text-sm transition-all">
          Try another module <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function ScoreCard({ label, data, percent, accent }) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-4xl font-black tracking-tighter ${accent ? 'text-orange-500' : 'text-slate-800'}`}>{percent !== null ? `${percent}%` : '—'}</p>
      <p className="text-xs font-bold text-slate-400 mt-2">{data ? `${data.score} / ${data.total} correct` : 'Not completed'}</p>
    </div>
  );
}

function GainCard({ gain, prePercent, postPercent }) {
  const up = gain > 0;
  const down = gain < 0;
  const Icon = up ? TrendingUp : down ? TrendingDown : Minus;
  return (
    <div className={`rounded-[2rem] p-6 sm:p-8 shadow-sm text-white ${up ? 'bg-green-500' : down ? 'bg-red-500' : 'bg-slate-800'}`}>
      <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Knowledge Gain</p>
      <div className="flex items-center gap-2">
        <Icon size={28} />
        <p className="text-4xl font-black tracking-tighter">{gain === null ? '—' : `${up ? '+' : ''}${gain}%`}</p>
      </div>
      <p className="text-xs font-bold opacity-80 mt-2">
        {gain === null ? 'Needs both tests' : `${prePercent}% → ${postPercent}% (percentage points)`}
      </p>
    </div>
  );
}

function GameTile({ icon, label, value, percent = null }) {
  const TileIcon = icon;
  return (
    <div className="bg-slate-50 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        <TileIcon size={16} />
        <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-2xl font-black text-slate-800">{value}</p>
      {percent !== null && (
        <div className="mt-3 h-1.5 bg-white rounded-full overflow-hidden" role="img" aria-label={`${percent} percent`}>
          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${percent}%` }} />
        </div>
      )}
    </div>
  );
}
