import { supabase } from './supabase';
import { CATEGORY_IDS, DEFAULT_QUESTIONS_PER_ATTEMPT } from './assessmentCategories';

// ---------------------------------------------------------------------------
// Assessment question bank — PARALLEL FORMS design, with 15 questions per
// bank (5 for each of Earthquake, Typhoon, and General Preparedness) and
// per-session randomization. This built-in bank is only the offline fallback;
// the live question bank (including the Landslide, Tsunami, and Volcanic
// Eruption categories) is managed in Admin > Assessment > Question Bank.
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
// category id (see assessmentCategories.js) written to Supabase. `correctIndex` is
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

export const ASSESSMENT_TYPE_BY_MODE = { pre: 'pre-assessment', post: 'post-assessment' };

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
 * Draws one attempt's questions from an already-category-filtered `pool`
 * (each `{ id, category, module, question, options, correctIndex }`): `count`
 * unique questions in random order, each with its options shuffled. If the
 * pool has fewer than `count` questions, all of them are used. Pure function —
 * call it fresh for every new attempt (first start or retake); reusing a
 * previous array would defeat "randomize every attempt".
 */
export function pickCategoryQuestions(pool, count = DEFAULT_QUESTIONS_PER_ATTEMPT) {
  return shuffleArray(pool).slice(0, count).map(shuffleQuestionOptions);
}

// Built-in fallback bank, filtered to one category. Only used when Supabase
// is unconfigured or a query fails — NOT when the DB simply has no active
// questions, so an admin who deactivates a category's questions isn't
// silently overridden by the hardcoded bank.
function staticQuestions(mode, category) {
  return (QUESTION_BANKS[mode] || QUESTION_BANKS.pre).filter((q) => q.module === category);
}

/**
 * Fetches the active, admin-managed questions for one `mode` ('pre' | 'post')
 * and `category` from `assessment_questions`. Filtering happens in Postgres
 * (assessment_type + module + is_active), so a session never downloads other
 * categories' questions. Never throws — on a Supabase error it returns the
 * built-in bank for that category so the assessment keeps working.
 */
export async function fetchCategoryQuestions(mode, category) {
  if (!supabase) return staticQuestions(mode, category);
  try {
    const { data, error } = await supabase
      .from('assessment_questions')
      .select('id, module, category, question, options, correct_index')
      .eq('assessment_type', ASSESSMENT_TYPE_BY_MODE[mode] || mode)
      .eq('module', category)
      .eq('is_active', true);
    if (error) throw error;
    return (data || []).map((q) => ({
      id: q.id,
      module: q.module,
      category: q.category || q.module,
      question: q.question,
      options: q.options,
      correctIndex: q.correct_index,
    }));
  } catch (err) {
    console.error('Failed to fetch assessment questions, falling back to built-in questions:', err.message);
    return staticQuestions(mode, category);
  }
}

/**
 * How many active questions exist per category for `mode`:
 * `{ [categoryId]: count }`. Drives the category picker (a category with no
 * questions is shown as unavailable). Never throws; falls back to counting
 * the built-in bank on error.
 */
export async function fetchCategoryAvailability(mode) {
  const counts = Object.fromEntries(CATEGORY_IDS.map((id) => [id, 0]));
  const fromStatic = () => {
    (QUESTION_BANKS[mode] || QUESTION_BANKS.pre).forEach((q) => { if (q.module in counts) counts[q.module] += 1; });
    return counts;
  };
  if (!supabase) return fromStatic();
  try {
    const { data, error } = await supabase
      .from('assessment_questions')
      .select('module')
      .eq('assessment_type', ASSESSMENT_TYPE_BY_MODE[mode] || mode)
      .eq('is_active', true);
    if (error) throw error;
    (data || []).forEach((q) => { if (q.module in counts) counts[q.module] += 1; });
    return counts;
  } catch (err) {
    console.error('Failed to fetch question availability, falling back to built-in counts:', err.message);
    return fromStatic();
  }
}
