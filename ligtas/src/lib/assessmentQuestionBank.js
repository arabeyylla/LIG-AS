import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Assessment question bank — PARALLEL FORMS design, now with 20 questions
// per bank (5 per disaster module) and per-session randomization.
//
// Pre- and Post-Assessment intentionally use DIFFERENT scenarios per module
// (not the same questions reworded) so a post-test score reflects retained
// understanding rather than memorization of the pre-test.
//
// Distractors are written to be plausible rather than obviously wrong
// (common myths, half-right actions, tempting-but-risky shortcuts) so the
// questions test reasoning, not just elimination.
//
// `category` is the display label on the question card; `module` is the
// normalized disaster_module value written to Supabase. `correctIndex` is
// the zero-based index of the correct option in the ORIGINAL (unshuffled)
// `options` array below — see shuffleQuestionOptions, which re-derives the
// correct index after shuffling for display.
// ---------------------------------------------------------------------------

const PRE_QUESTION_BANK = [
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
    id: 'pre-eq3',
    category: 'Earthquake',
    module: 'Earthquake',
    question: 'You live in a one-story house. During shaking, a heavy bookshelf near you begins to tip. What should you do?',
    options: [
      'Try to catch or steady the bookshelf to keep it from falling',
      'Move away and Drop, Cover, and Hold On under a sturdy table if one is nearby',
      'Push it away from you toward an open doorway',
      'Stay exactly where you are since moving during shaking is dangerous',
    ],
    correctIndex: 1,
  },
  {
    id: 'pre-eq4',
    category: 'Earthquake',
    module: 'Earthquake',
    question: 'If you cannot reach open ground during shaking, which of these locations is generally SAFEST?',
    options: [
      'Near tall, unsecured cabinets or shelving',
      'Under a sturdy table or desk, away from windows and heavy furniture',
      'Next to a large glass window',
      'In a stairwell crowded with other people trying to exit',
    ],
    correctIndex: 1,
  },
  {
    id: 'pre-eq5',
    category: 'Earthquake',
    module: 'Earthquake',
    question: 'You feel shaking while inside a crowded shopping mall. What is the safest response?',
    options: [
      'Rush toward the nearest exit with the crowd immediately',
      'Drop, Cover, and Hold On where you are, away from display shelves and glass, then exit calmly once shaking stops',
      'Stand still in the middle of the walkway',
      'Get on an escalator to move to another floor',
    ],
    correctIndex: 1,
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
    id: 'pre-ty3',
    category: 'Typhoon',
    module: 'Typhoon',
    question: 'Local news reports the typhoon has been upgraded to a higher signal number overnight. What does a higher signal number mean?',
    options: [
      'The storm is moving farther away and weakening',
      'Stronger expected winds and greater potential damage in your area',
      'The chance of rain has decreased',
      'Signal numbers only matter for coastal areas, not inland areas',
    ],
    correctIndex: 1,
  },
  {
    id: 'pre-ty4',
    category: 'Typhoon',
    module: 'Typhoon',
    question: 'Before a typhoon, why is it recommended to fully charge phones/power banks and store clean water?',
    options: [
      'Because phones use less battery during storms',
      'To prepare for possible power and water service interruptions',
      'Because typhoons always improve phone signal',
      'It’s a tradition with no real safety benefit',
    ],
    correctIndex: 1,
  },
  {
    id: 'pre-ty5',
    category: 'Typhoon',
    module: 'Typhoon',
    question: 'Your neighborhood is near a river that has flooded during past typhoons. What should factor most into your preparation?',
    options: [
      'Assume this typhoon will be no different from ones that caused no flooding',
      'Identify a higher-ground evacuation route in advance, in case of flash flooding',
      'Ignore the river since typhoons mainly bring wind, not flooding',
      'Wait for the river to visibly overflow before making any plans',
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
    id: 'pre-fl2',
    category: 'Flood',
    module: 'Flood',
    question: 'You’re indoors and floodwater starts entering the ground floor of your house. What should you prioritize?',
    options: [
      'Stay on the ground floor to protect your belongings',
      'Move to a higher floor or the roof, avoiding enclosed spaces like attics without an exit',
      'Go outside and wade through the water to a neighbor’s house immediately',
      'Use electrical appliances as usual since the power is still on',
    ],
    correctIndex: 1,
  },
  {
    id: 'pre-fl3',
    category: 'Flood',
    module: 'Flood',
    question: 'Which statement about floodwater is TRUE?',
    options: [
      'Floodwater is generally clean and safe to walk through',
      'Floodwater can be contaminated and may hide hazards like open manholes or debris',
      'Floodwater only poses a risk if it is above your waist',
      'Floodwater cannot carry electrical current',
    ],
    correctIndex: 1,
  },
  {
    id: 'pre-fl4',
    category: 'Flood',
    module: 'Flood',
    question: 'A flood advisory has been issued for your barangay. What is the most appropriate action?',
    options: [
      'Ignore it unless you can already see water on the street',
      'Monitor official updates, prepare a go-bag, and be ready to evacuate to higher ground if advised',
      'Drive around the area to check water levels yourself',
      'Wait for the water to reach your doorstep before doing anything',
    ],
    correctIndex: 1,
  },
  {
    id: 'pre-fl5',
    category: 'Flood',
    module: 'Flood',
    question: 'Why should you avoid contact with electrical equipment or outlets during or after a flood?',
    options: [
      'It’s not actually necessary if the equipment looks dry',
      'Water and dampness can conduct electricity and cause electrocution',
      'Electrical equipment automatically shuts off during floods',
      'Only outdoor outlets pose any electrocution risk',
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
  {
    id: 'pre-gen2',
    category: 'General Preparedness',
    module: 'General',
    question: 'What is the main purpose of conducting regular household earthquake or fire drills?',
    options: [
      'To satisfy a school or workplace requirement only',
      'To build muscle memory so the household reacts quickly and correctly under real stress',
      'To waste time since real emergencies rarely happen as drills predict',
      'To identify who is the fastest runner in the household',
    ],
    correctIndex: 1,
  },
  {
    id: 'pre-gen3',
    category: 'General Preparedness',
    module: 'General',
    question: 'Which of these is the BEST reason to identify a family meeting point before a disaster?',
    options: [
      'It’s required by law in every barangay',
      'Family members may get separated during evacuation, and a meeting point helps reunite them safely',
      'It replaces the need for an emergency go-bag',
      'It’s only useful for large families',
    ],
    correctIndex: 1,
  },
  {
    id: 'pre-gen4',
    category: 'General Preparedness',
    module: 'General',
    question: 'You’re helping a household prepare an emergency plan. Which detail is LEAST likely to be useful in that plan?',
    options: [
      'Contact numbers of family members and emergency services',
      'The household’s favorite TV shows and hobbies',
      'Location of the nearest evacuation center',
      'A designated meeting point if separated',
    ],
    correctIndex: 1,
  },
  {
    id: 'pre-gen5',
    category: 'General Preparedness',
    module: 'General',
    question: 'Why is it important to know the specific hazards common to your local area, rather than relying only on general disaster tips?',
    options: [
      'General tips are always wrong and should be ignored',
      'Local hazards affect which specific risks and evacuation routes apply to your household',
      'It isn’t important — all areas face the same risks equally',
      'Only barangay officials need to know local hazard information',
    ],
    correctIndex: 1,
  },
];

const POST_QUESTION_BANK = [
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
    id: 'post-eq3',
    category: 'Earthquake',
    module: 'Earthquake',
    question: 'During an earthquake, you’re in a wheelchair or have limited mobility indoors. What is the recommended action?',
    options: [
      'Attempt to stand and walk to the nearest exit immediately',
      'Lock the wheelchair’s wheels (if applicable), cover your head and neck, and stay away from windows and heavy furniture',
      'Wait exactly where you are regardless of nearby hazards',
      'Call for help and remain near a window for visibility',
    ],
    correctIndex: 1,
  },
  {
    id: 'post-eq4',
    category: 'Earthquake',
    module: 'Earthquake',
    question: 'After earthquake shaking stops, you smell gas inside your home. What should you do?',
    options: [
      'Light a candle to check where the smell is coming from',
      'Avoid using switches or open flames, leave the area, and report the leak once safe',
      'Open all the windows and stay inside to air it out',
      'Ignore it if the smell is faint',
    ],
    correctIndex: 1,
  },
  {
    id: 'post-eq5',
    category: 'Earthquake',
    module: 'Earthquake',
    question: 'Which of these is the BEST long-term action a household can take to reduce earthquake risk at home?',
    options: [
      'Anchor heavy furniture and appliances to the wall and secure hanging objects',
      'Leave all furniture unsecured since anchoring doesn’t help',
      'Keep breakable and heavy items on high, open shelves for easy access',
      'Only worry about earthquake-proofing during an actual earthquake',
    ],
    correctIndex: 0,
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
    id: 'post-ty3',
    category: 'Typhoon',
    module: 'Typhoon',
    question: 'Which of these is a warning sign that a typhoon is intensifying and you should finalize preparations?',
    options: [
      'The wind and rain suddenly stop completely and permanently',
      'Official bulletins raise the storm signal number for your area',
      'Local shops start opening longer hours',
      'Social media posts about the storm decrease',
    ],
    correctIndex: 1,
  },
  {
    id: 'post-ty4',
    category: 'Typhoon',
    module: 'Typhoon',
    question: 'Your area experienced significant flooding from typhoon rains, and the water has started to recede. What should you check before returning home?',
    options: [
      'Nothing — receding water means it’s immediately safe',
      'Structural safety, contaminated-water damage, and downed utility lines, ideally with official clearance',
      'Only whether the electricity has been restored',
      'Whether your neighbors have already returned',
    ],
    correctIndex: 1,
  },
  {
    id: 'post-ty5',
    category: 'Typhoon',
    module: 'Typhoon',
    question: 'Which practice best supports a household’s typhoon readiness for FUTURE storms, not just the current one?',
    options: [
      'Restocking the emergency kit and reviewing the family plan after each typhoon season',
      'Discarding the emergency kit once a typhoon has passed',
      'Assuming the same preparations never need to be reviewed again',
      'Relying solely on memory instead of a written family plan',
    ],
    correctIndex: 0,
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
    id: 'post-fl2',
    category: 'Flood',
    module: 'Flood',
    question: 'While driving, you encounter a flooded roadway ahead with water covering the tires of stalled cars. What should you do?',
    options: [
      'Continue slowly since your vehicle is larger than the stalled ones',
      'Turn around and find an alternate route — do not attempt to cross',
      'Follow closely behind another vehicle that is crossing',
      'Wait in the car in the middle of the flooded road until it’s over',
    ],
    correctIndex: 1,
  },
  {
    id: 'post-fl3',
    category: 'Flood',
    module: 'Flood',
    question: 'After a flood recedes from your home, what is the recommended FIRST step before cleaning up?',
    options: [
      'Immediately turn the electricity back on to power fans and lights',
      'Have utilities inspected and confirmed safe before turning them back on, and wear protective gear while cleaning',
      'Begin cleaning without checking for structural or electrical hazards',
      'Eat any food that was exposed to floodwater to avoid waste',
    ],
    correctIndex: 1,
  },
  {
    id: 'post-fl4',
    category: 'Flood',
    module: 'Flood',
    question: 'Why do local governments often issue mandatory evacuation orders in flood-prone areas even if residents want to stay?',
    options: [
      'To inconvenience residents unnecessarily',
      'Because rescue becomes far more dangerous once floodwaters rise further, and early evacuation protects lives',
      'Because it’s standard procedure with no real safety reasoning',
      'Evacuation orders are optional and rarely necessary',
    ],
    correctIndex: 1,
  },
  {
    id: 'post-fl5',
    category: 'Flood',
    module: 'Flood',
    question: 'What is a practical way to reduce flood risk to important documents and valuables before flood season?',
    options: [
      'Leave them on the floor for easy access',
      'Store them in a waterproof container and keep copies or digital backups',
      'Assume documents don’t need any special protection',
      'Only protect documents during the flood itself, not beforehand',
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
  {
    id: 'post-gen2',
    category: 'General Preparedness',
    module: 'General',
    question: 'Now that you’ve played LIG+AS, what is the value of practicing disaster response in a simulation before a real event?',
    options: [
      'Simulations have no real value since they aren’t real emergencies',
      'It builds familiarity and faster, calmer decision-making that can carry over to real situations',
      'It’s only useful for entertainment purposes',
      'It replaces the need for any real household emergency plan',
    ],
    correctIndex: 1,
  },
  {
    id: 'post-gen3',
    category: 'General Preparedness',
    module: 'General',
    question: 'Which best describes how often a household emergency plan should be reviewed?',
    options: [
      'Only once, when it is first created',
      'Regularly — e.g., whenever household members, risks, or circumstances change',
      'Never, since plans don’t need updates',
      'Only after a disaster has already occurred',
    ],
    correctIndex: 1,
  },
  {
    id: 'post-gen4',
    category: 'General Preparedness',
    module: 'General',
    question: 'A classmate says disaster preparedness is "just common sense" and doesn’t need practice. What is the best response, based on what you’ve learned?',
    options: [
      'Agree — no practice is needed',
      'Explain that stress during real emergencies can impair decision-making, so practiced responses matter',
      'Ignore the comment since it doesn’t matter',
      'Preparedness only matters for emergency responders, not regular people',
    ],
    correctIndex: 1,
  },
  {
    id: 'post-gen5',
    category: 'General Preparedness',
    module: 'General',
    question: 'Which of these best reflects a complete household emergency kit, based on what LIG+AS emphasizes?',
    options: [
      'Only a flashlight, since light is the most important resource',
      'Water, food, first aid supplies, important documents, a flashlight, and a way to communicate',
      'Entertainment items only, to stay calm during a disaster',
      'No kit is needed if you plan to evacuate immediately',
    ],
    correctIndex: 1,
  },
];

export const QUESTION_BANKS = { pre: PRE_QUESTION_BANK, post: POST_QUESTION_BANK };

export const DISASTER_MODULES = ['Earthquake', 'Typhoon', 'Flood', 'General'];

// Default "how many questions per module" quotas for a session. Stratified
// (not pure random) so every attempt covers all 4 modules — pure random
// draws from a flat pool could occasionally skip a module entirely, which
// would leave a gap in that module's admin pass-rate stat for this attempt
// and wouldn't reflect broad preparedness coverage.
//
// This is the FALLBACK used when the admin hasn't configured custom quotas
// (or Supabase isn't reachable) — see site_settings key
// `assessment_module_quotas`, editable from the admin Assessment Results >
// Question Bank tab.
export const DEFAULT_MODULE_QUOTAS = { Earthquake: 3, Typhoon: 3, Flood: 2, General: 2 };

/** Fisher-Yates shuffle. Returns a new array; does not mutate the input. */
export function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Returns a copy of `question` with its options shuffled and `correctIndex`
 * re-derived to match the new order, so the answer key still points at the
 * right option after shuffling.
 */
export function shuffleQuestionOptions(question) {
  const correctOption = question.options[question.correctIndex];
  const options = shuffleArray(question.options);
  return { ...question, options, correctIndex: options.indexOf(correctOption) };
}

/**
 * Draws a randomized session from an already-resolved `pool` of questions
 * (each `{ id, category, module, question, options, correctIndex }`):
 * `quotas` unique questions per module (no repeats within a session),
 * each question's option order shuffled, and the overall question order
 * shuffled. Pure function — `pool` can come from the static bank or from
 * Supabase (see fetchQuestionPool below). Call fresh for every new attempt
 * (mode switch or retake) — never reuse a session's array across attempts,
 * or "randomize every attempt" stops being true.
 */
export function pickSessionQuestions(pool, quotas = DEFAULT_MODULE_QUOTAS) {
  const picked = Object.entries(quotas).flatMap(([moduleName, quota]) => {
    const moduleQuestions = pool.filter((q) => q.module === moduleName);
    return shuffleArray(moduleQuestions).slice(0, Math.min(quota, moduleQuestions.length));
  });
  return shuffleArray(picked).map(shuffleQuestionOptions);
}

/**
 * Convenience wrapper around pickSessionQuestions using the static
 * hardcoded bank for `mode` ('pre' | 'post') — the fallback path used when
 * Supabase isn't configured or the `assessment_questions` table can't be
 * reached. See src/pages/Assessment.jsx for where the DB pool is preferred
 * when available.
 */
export function buildSessionQuestions(mode, quotas = DEFAULT_MODULE_QUOTAS) {
  const bank = QUESTION_BANKS[mode] || QUESTION_BANKS.pre;
  return pickSessionQuestions(bank, quotas);
}

export const ASSESSMENT_TYPE_BY_MODE = { pre: 'pre-assessment', post: 'post-assessment' };

/**
 * Fetches the active, admin-managed question pool for `mode` ('pre' |
 * 'post') from the `assessment_questions` table. Never throws — returns an
 * empty array if Supabase isn't configured or the query fails, so callers
 * (see src/pages/Assessment.jsx) can fall back to the static QUESTION_BANKS
 * bank above and the assessment keeps working regardless of DB state.
 */
export async function fetchQuestionPool(mode) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('assessment_questions')
      .select('id, module, category, question, options, correct_index, is_active')
      .eq('assessment_type', ASSESSMENT_TYPE_BY_MODE[mode] || mode);
    if (error) throw error;
    return (data || [])
      .filter((q) => q.is_active ?? true)
      .map((q) => ({
        id: q.id,
        module: q.module,
        category: q.category || q.module,
        question: q.question,
        options: q.options,
        correctIndex: q.correct_index,
      }));
  } catch (err) {
    console.error('Failed to fetch assessment question pool, falling back to built-in questions:', err.message);
    return [];
  }
}
