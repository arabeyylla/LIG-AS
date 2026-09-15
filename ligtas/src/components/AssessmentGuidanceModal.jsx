import { useState } from 'react';
import { Info, ShieldCheck, ArrowRight, ShieldAlert } from 'lucide-react';

const NOTICE_COPY = {
  pre: {
    icon: Info,
    accent: 'bg-blue-100 text-blue-500',
    heading: 'Before you begin',
    body: 'Notice: Take this assessment BEFORE playing the LIG+AS simulation to measure your baseline preparedness.',
  },
  post: {
    icon: ShieldCheck,
    accent: 'bg-orange-100 text-orange-500',
    heading: 'Before you continue',
    body: 'Confirmation: Please ensure you have completed playing the LIG+AS simulation before proceeding with the Post-Assessment.',
  },
};

const CONSENT_TEXT =
  'I understand the purpose of this evaluation and consent to submitting my assessment data for LIG+AS research.';

/**
 * Combined guidance + data-privacy consent modal, shown before a player
 * enters (or re-enters, e.g. on retake) the Pre- or Post-Assessment. Gates
 * the assessment form entirely — nothing behind it is reachable until the
 * player confirms, and for Post-Assessment they must also tick "I've
 * finished playing" first.
 *
 * `consentGiven`/`onConsentChange` are lifted to the parent (Assessment.jsx)
 * so consent, once given, persists across repeated openings of this modal
 * within the session — the checkbox stays visible and re-editable every
 * time (satisfying "before starting or submitting" at every gate) without
 * forcing the player to re-tick it on every tab switch.
 */
export default function AssessmentGuidanceModal({ type, consentGiven, onConsentChange, onConfirm, onCancel }) {
  const [playedConfirmed, setPlayedConfirmed] = useState(false);
  const isPost = type === 'post';
  const copy = NOTICE_COPY[type] || NOTICE_COPY.pre;
  const Icon = copy.icon;

  const canProceed = consentGiven && (!isPost || playedConfirmed);

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/50" onClick={onCancel}>
      <div
        className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
        role="alertdialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`w-14 h-14 mb-5 rounded-2xl flex items-center justify-center ${copy.accent}`}>
          <Icon size={26} />
        </div>
        <h3 className="text-lg font-black text-slate-800 mb-2">{copy.heading}</h3>
        <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">{copy.body}</p>

        {isPost && (
          <label className="flex items-start gap-3 mb-4 p-4 bg-slate-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={playedConfirmed}
              onChange={(e) => setPlayedConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-orange-500 flex-shrink-0"
            />
            <span className="text-sm font-bold text-slate-700">I confirm I have finished playing LIG+AS.</span>
          </label>
        )}

        <div className="mb-6 p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={15} className="text-slate-400" />
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Data Privacy Notice</span>
          </div>
          <p className="text-xs font-medium text-slate-500 leading-relaxed mb-3">
            Your Student ID / email and assessment responses are collected for academic research and to measure
            LIG+AS's effectiveness as a disaster-preparedness tool. They are used only for these purposes.
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => onConsentChange(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-orange-500 flex-shrink-0"
            />
            <span className="text-xs font-bold text-slate-700">{CONSENT_TEXT}</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-5 py-3 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={!canProceed}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPost ? 'Proceed' : 'Got it, Start'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
