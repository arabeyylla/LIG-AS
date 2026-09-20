import { ClipboardList, ClipboardCheck, BarChart3, ArrowRight } from 'lucide-react';

const TYPE_CARDS = [
  {
    type: 'pre',
    step: 'Step 1',
    title: 'Pre-Assessment',
    tagline: 'Before you play',
    description: 'Measure your baseline disaster-preparedness knowledge before starting the LIG+AS simulation.',
    icon: ClipboardList,
    iconClass: 'bg-blue-100 text-blue-500',
  },
  {
    type: 'post',
    step: 'Step 2',
    title: 'Post-Assessment',
    tagline: 'After you play',
    description: 'Finished the simulation? See how much you have learned by retaking the check on the same category.',
    icon: ClipboardCheck,
    iconClass: 'bg-orange-100 text-orange-500',
  },
];

/**
 * First step of the Assessment flow: choose Pre- or Post-Assessment (or jump
 * to this device's results). Picking a card only changes the step inside the
 * /assessment page — it does not navigate to another route.
 */
export default function AssessmentTypeSelector({ onSelectType, onViewResults }) {
  return (
    <div>
      <div className="grid md:grid-cols-2 gap-5">
        {TYPE_CARDS.map(({ type, step, title, tagline, description, icon, iconClass }) => {
          const Icon = icon;
          return (
          <button
            key={type}
            type="button"
            onClick={() => onSelectType(type)}
            className="group text-left bg-white rounded-[2rem] border-2 border-slate-100 hover:border-orange-400 p-8 shadow-sm hover:shadow-xl hover:shadow-orange-100 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/30"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconClass}`}>
                <Icon size={26} />
              </div>
              <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{step}</span>
            </div>
            <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1">{tagline}</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3">{title}</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">{description}</p>
            <span className="inline-flex items-center gap-2 text-sm font-black text-orange-500 group-hover:gap-3 transition-all">
              Choose a category <ArrowRight size={16} />
            </span>
          </button>
          );
        })}
      </div>

      <div className="flex justify-center mt-8">
        <button
          type="button"
          onClick={onViewResults}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-black transition-all"
        >
          <BarChart3 size={16} /> View my results
        </button>
      </div>
    </div>
  );
}
