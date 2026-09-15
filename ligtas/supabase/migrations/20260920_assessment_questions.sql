-- Moves the Assessment question bank from a hardcoded file
-- (src/lib/assessmentQuestionBank.js) into a database table the admin
-- panel can manage: view every question, add/edit/delete questions and
-- their options, and toggle which ones are eligible to appear on the
-- public site. Run in Supabase Dashboard > SQL Editor.
--
-- BACKWARD COMPATIBILITY: the frontend still ships with the original
-- hardcoded bank as a fallback (src/lib/assessmentQuestionBank.js is
-- unchanged). If this table is empty, unreachable, or Supabase isn't
-- configured, the public Assessment page silently falls back to that
-- static bank — so the assessment keeps working even before this
-- migration is applied. This migration also seeds the table with the
-- SAME 40 questions already live in that file, so nothing changes for
-- players on day one; the admin's new "Question Bank" tab just shows the
-- real, already-in-use content instead of starting empty.

create extension if not exists pgcrypto;

create table if not exists public.assessment_questions (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,                             -- ties a seeded row back to its original hardcoded id; null for admin-created questions
  assessment_type text not null check (assessment_type in ('pre-assessment', 'post-assessment')),
  module text not null check (module in ('Earthquake', 'Typhoon', 'Flood', 'General')),
  category text not null default '',                 -- display label on the question card (usually same as module)
  question text not null,
  options text[] not null check (array_length(options, 1) = 4),
  correct_index smallint not null check (correct_index between 0 and 3),
  is_active boolean not null default true,            -- whether this question is eligible to be drawn into a session
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assessment_questions_type_module_idx on public.assessment_questions (assessment_type, module);
create index if not exists assessment_questions_active_idx on public.assessment_questions (is_active);

alter table public.assessment_questions enable row level security;

-- Anyone (including anonymous players) can read questions — needed so the
-- public Assessment page can build a session client-side. Question content
-- isn't sensitive; only admin write access needs to be restricted.
drop policy if exists "Public can read assessment questions" on public.assessment_questions;
create policy "Public can read assessment questions"
  on public.assessment_questions for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can manage assessment questions" on public.assessment_questions;
create policy "Admins can manage assessment questions"
  on public.assessment_questions for all
  to authenticated
  using (true)
  with check (true);

-- Keeps `updated_at` current on every edit, so the admin list can show
-- "last edited" accurately.
create or replace function public.set_assessment_question_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists assessment_questions_set_updated_at on public.assessment_questions;
create trigger assessment_questions_set_updated_at
  before update on public.assessment_questions
  for each row
  execute function public.set_assessment_question_updated_at();

-- Seed data: the same 40 questions already hardcoded in
-- src/lib/assessmentQuestionBank.js (20 Pre-Assessment, 20 Post-
-- Assessment; 5 per disaster module in each). `on conflict do nothing`
-- makes this safe to re-run.
insert into public.assessment_questions
  (legacy_id, assessment_type, module, category, question, options, correct_index)
values
  ('pre-eq1', 'pre-assessment', 'Earthquake', 'Earthquake', 'You are inside a classroom on the 3rd floor when strong shaking begins. What is the safest immediate action?', array['Immediately run for the stairwell to exit the building', 'Drop to the ground, take cover under a sturdy desk, and hold on until the shaking stops', 'Move to a doorway and brace yourself against the frame', 'Stand against an interior wall away from windows']::text[], 1),
  ('pre-eq2', 'pre-assessment', 'Earthquake', 'Earthquake', 'Immediately after strong shaking stops in a multi-story building, what should occupants do first, before evacuating?', array['Take the elevator down quickly in case of aftershocks', 'Gather personal belongings from their desks before leaving', 'Check themselves and others for injuries, then check for hazards like broken glass or gas odors', 'Wait for an "all clear" announcement over the intercom before doing anything']::text[], 2),
  ('pre-eq3', 'pre-assessment', 'Earthquake', 'Earthquake', 'You live in a one-story house. During shaking, a heavy bookshelf near you begins to tip. What should you do?', array['Try to catch or steady the bookshelf to keep it from falling', 'Move away and Drop, Cover, and Hold On under a sturdy table if one is nearby', 'Push it away from you toward an open doorway', 'Stay exactly where you are since moving during shaking is dangerous']::text[], 1),
  ('pre-eq4', 'pre-assessment', 'Earthquake', 'Earthquake', 'If you cannot reach open ground during shaking, which of these locations is generally SAFEST?', array['Near tall, unsecured cabinets or shelving', 'Under a sturdy table or desk, away from windows and heavy furniture', 'Next to a large glass window', 'In a stairwell crowded with other people trying to exit']::text[], 1),
  ('pre-eq5', 'pre-assessment', 'Earthquake', 'Earthquake', 'You feel shaking while inside a crowded shopping mall. What is the safest response?', array['Rush toward the nearest exit with the crowd immediately', 'Drop, Cover, and Hold On where you are, away from display shelves and glass, then exit calmly once shaking stops', 'Stand still in the middle of the walkway', 'Get on an escalator to move to another floor']::text[], 1),
  ('pre-ty1', 'pre-assessment', 'Typhoon', 'Typhoon', 'A typhoon warning has just been raised for your area, and the storm is still 24 hours away. What should you prioritize now?', array['Wait until the rain starts before deciding whether to prepare', 'Charge devices, secure loose outdoor items, and stock up on water and non-perishable food', 'Board up all windows and evacuate immediately, regardless of your area’s risk level', 'Turn off the main water supply to prevent flooding inside the house']::text[], 1),
  ('pre-ty2', 'pre-assessment', 'Typhoon', 'Typhoon', 'During the height of a typhoon, the wind suddenly calms and the sky clears. What does this most likely mean?', array['The typhoon has passed and it is now safe to go outside', 'You are in the eye of the storm — violent winds will resume, likely from the opposite direction', 'The storm has weakened into a tropical depression', 'It is safe to check for damage around your property']::text[], 1),
  ('pre-ty3', 'pre-assessment', 'Typhoon', 'Typhoon', 'Local news reports the typhoon has been upgraded to a higher signal number overnight. What does a higher signal number mean?', array['The storm is moving farther away and weakening', 'Stronger expected winds and greater potential damage in your area', 'The chance of rain has decreased', 'Signal numbers only matter for coastal areas, not inland areas']::text[], 1),
  ('pre-ty4', 'pre-assessment', 'Typhoon', 'Typhoon', 'Before a typhoon, why is it recommended to fully charge phones/power banks and store clean water?', array['Because phones use less battery during storms', 'To prepare for possible power and water service interruptions', 'Because typhoons always improve phone signal', 'It’s a tradition with no real safety benefit']::text[], 1),
  ('pre-ty5', 'pre-assessment', 'Typhoon', 'Typhoon', 'Your neighborhood is near a river that has flooded during past typhoons. What should factor most into your preparation?', array['Assume this typhoon will be no different from ones that caused no flooding', 'Identify a higher-ground evacuation route in advance, in case of flash flooding', 'Ignore the river since typhoons mainly bring wind, not flooding', 'Wait for the river to visibly overflow before making any plans']::text[], 1),
  ('pre-fl1', 'pre-assessment', 'Flood', 'Flood', 'Floodwater has risen ankle-deep on the street outside your home, and your car is parked there. What is the safest choice?', array['Quickly drive the car to higher ground before the water rises further', 'Leave the car — moving water as shallow as six inches can sweep it off the road or stall the engine', 'Push the car manually into a garage to protect it', 'Wait inside the car until the water recedes']::text[], 1),
  ('pre-fl2', 'pre-assessment', 'Flood', 'Flood', 'You’re indoors and floodwater starts entering the ground floor of your house. What should you prioritize?', array['Stay on the ground floor to protect your belongings', 'Move to a higher floor or the roof, avoiding enclosed spaces like attics without an exit', 'Go outside and wade through the water to a neighbor’s house immediately', 'Use electrical appliances as usual since the power is still on']::text[], 1),
  ('pre-fl3', 'pre-assessment', 'Flood', 'Flood', 'Which statement about floodwater is TRUE?', array['Floodwater is generally clean and safe to walk through', 'Floodwater can be contaminated and may hide hazards like open manholes or debris', 'Floodwater only poses a risk if it is above your waist', 'Floodwater cannot carry electrical current']::text[], 1),
  ('pre-fl4', 'pre-assessment', 'Flood', 'Flood', 'A flood advisory has been issued for your barangay. What is the most appropriate action?', array['Ignore it unless you can already see water on the street', 'Monitor official updates, prepare a go-bag, and be ready to evacuate to higher ground if advised', 'Drive around the area to check water levels yourself', 'Wait for the water to reach your doorstep before doing anything']::text[], 1),
  ('pre-fl5', 'pre-assessment', 'Flood', 'Flood', 'Why should you avoid contact with electrical equipment or outlets during or after a flood?', array['It’s not actually necessary if the equipment looks dry', 'Water and dampness can conduct electricity and cause electrocution', 'Electrical equipment automatically shuts off during floods', 'Only outdoor outlets pose any electrocution risk']::text[], 1),
  ('pre-gen1', 'pre-assessment', 'General', 'General Preparedness', 'You’re assembling a family emergency ("go") bag for the first 72 hours. Which item is LEAST essential to prioritize?', array['A three-day supply of water and non-perishable food', 'Copies of important documents in a waterproof pouch', 'A portable gaming console for entertainment', 'A battery-powered or hand-crank radio']::text[], 2),
  ('pre-gen2', 'pre-assessment', 'General', 'General Preparedness', 'What is the main purpose of conducting regular household earthquake or fire drills?', array['To satisfy a school or workplace requirement only', 'To build muscle memory so the household reacts quickly and correctly under real stress', 'To waste time since real emergencies rarely happen as drills predict', 'To identify who is the fastest runner in the household']::text[], 1),
  ('pre-gen3', 'pre-assessment', 'General', 'General Preparedness', 'Which of these is the BEST reason to identify a family meeting point before a disaster?', array['It’s required by law in every barangay', 'Family members may get separated during evacuation, and a meeting point helps reunite them safely', 'It replaces the need for an emergency go-bag', 'It’s only useful for large families']::text[], 1),
  ('pre-gen4', 'pre-assessment', 'General', 'General Preparedness', 'You’re helping a household prepare an emergency plan. Which detail is LEAST likely to be useful in that plan?', array['Contact numbers of family members and emergency services', 'The household’s favorite TV shows and hobbies', 'Location of the nearest evacuation center', 'A designated meeting point if separated']::text[], 1),
  ('pre-gen5', 'pre-assessment', 'General', 'General Preparedness', 'Why is it important to know the specific hazards common to your local area, rather than relying only on general disaster tips?', array['General tips are always wrong and should be ignored', 'Local hazards affect which specific risks and evacuation routes apply to your household', 'It isn’t important — all areas face the same risks equally', 'Only barangay officials need to know local hazard information']::text[], 1),
  ('post-eq1', 'post-assessment', 'Earthquake', 'Earthquake', 'While driving during an earthquake, what is the correct response?', array['Speed up to reach a safe location as quickly as possible', 'Slow down and pull over away from buildings, bridges, and overpasses, then stay inside until shaking stops', 'Stop immediately wherever you are, even if that is under an overpass', 'Get out of the car and lie flat on the road']::text[], 1),
  ('post-eq2', 'post-assessment', 'Earthquake', 'Earthquake', 'Several days after a major earthquake, smaller aftershocks are still occurring. What should residents of a visibly cracked building do?', array['Ignore the aftershocks since the main earthquake already happened', 'Move back in as soon as the shaking feels weaker than the main quake', 'Avoid re-entering until officials have inspected and cleared the structure, since aftershocks can cause further collapse', 'Only avoid the building if it has already collapsed']::text[], 2),
  ('post-eq3', 'post-assessment', 'Earthquake', 'Earthquake', 'During an earthquake, you’re in a wheelchair or have limited mobility indoors. What is the recommended action?', array['Attempt to stand and walk to the nearest exit immediately', 'Lock the wheelchair’s wheels (if applicable), cover your head and neck, and stay away from windows and heavy furniture', 'Wait exactly where you are regardless of nearby hazards', 'Call for help and remain near a window for visibility']::text[], 1),
  ('post-eq4', 'post-assessment', 'Earthquake', 'Earthquake', 'After earthquake shaking stops, you smell gas inside your home. What should you do?', array['Light a candle to check where the smell is coming from', 'Avoid using switches or open flames, leave the area, and report the leak once safe', 'Open all the windows and stay inside to air it out', 'Ignore it if the smell is faint']::text[], 1),
  ('post-eq5', 'post-assessment', 'Earthquake', 'Earthquake', 'Which of these is the BEST long-term action a household can take to reduce earthquake risk at home?', array['Anchor heavy furniture and appliances to the wall and secure hanging objects', 'Leave all furniture unsecured since anchoring doesn’t help', 'Keep breakable and heavy items on high, open shelves for easy access', 'Only worry about earthquake-proofing during an actual earthquake']::text[], 0),
  ('post-ty1', 'post-assessment', 'Typhoon', 'Typhoon', 'Local officials issue a mandatory evacuation order for your area as a typhoon approaches. What should you do?', array['Stay home since your house has survived previous typhoons without damage', 'Evacuate to the designated evacuation center as instructed, even if the weather still looks calm', 'Wait until conditions visibly worsen before deciding', 'Evacuate only if you personally judge the storm to be dangerous enough']::text[], 1),
  ('post-ty2', 'post-assessment', 'Typhoon', 'Typhoon', 'After a typhoon passes, you see a downed power line near your street. What is the correct action?', array['Move it carefully to the side of the road so vehicles can pass', 'Assume it may still be live, stay away, and report it to the authorities immediately', 'It’s safe to touch as long as it looks undamaged', 'Only avoid it if it is visibly sparking']::text[], 1),
  ('post-ty3', 'post-assessment', 'Typhoon', 'Typhoon', 'Which of these is a warning sign that a typhoon is intensifying and you should finalize preparations?', array['The wind and rain suddenly stop completely and permanently', 'Official bulletins raise the storm signal number for your area', 'Local shops start opening longer hours', 'Social media posts about the storm decrease']::text[], 1),
  ('post-ty4', 'post-assessment', 'Typhoon', 'Typhoon', 'Your area experienced significant flooding from typhoon rains, and the water has started to recede. What should you check before returning home?', array['Nothing — receding water means it’s immediately safe', 'Structural safety, contaminated-water damage, and downed utility lines, ideally with official clearance', 'Only whether the electricity has been restored', 'Whether your neighbors have already returned']::text[], 1),
  ('post-ty5', 'post-assessment', 'Typhoon', 'Typhoon', 'Which practice best supports a household’s typhoon readiness for FUTURE storms, not just the current one?', array['Restocking the emergency kit and reviewing the family plan after each typhoon season', 'Discarding the emergency kit once a typhoon has passed', 'Assuming the same preparations never need to be reviewed again', 'Relying solely on memory instead of a written family plan']::text[], 0),
  ('post-fl1', 'post-assessment', 'Flood', 'Flood', 'You need to evacuate on foot and the only route crosses moving floodwater that looks shallow. What is the safest approach?', array['Walk quickly through the fastest-looking path to minimize exposure time', 'Avoid the water if at all possible; if you must cross, use a stick to check depth and never cross water above your knees', 'It’s safe to wade through as long as it doesn’t reach your waist', 'Hold hands with others in a line and walk through together for stability']::text[], 1),
  ('post-fl2', 'post-assessment', 'Flood', 'Flood', 'While driving, you encounter a flooded roadway ahead with water covering the tires of stalled cars. What should you do?', array['Continue slowly since your vehicle is larger than the stalled ones', 'Turn around and find an alternate route — do not attempt to cross', 'Follow closely behind another vehicle that is crossing', 'Wait in the car in the middle of the flooded road until it’s over']::text[], 1),
  ('post-fl3', 'post-assessment', 'Flood', 'Flood', 'After a flood recedes from your home, what is the recommended FIRST step before cleaning up?', array['Immediately turn the electricity back on to power fans and lights', 'Have utilities inspected and confirmed safe before turning them back on, and wear protective gear while cleaning', 'Begin cleaning without checking for structural or electrical hazards', 'Eat any food that was exposed to floodwater to avoid waste']::text[], 1),
  ('post-fl4', 'post-assessment', 'Flood', 'Flood', 'Why do local governments often issue mandatory evacuation orders in flood-prone areas even if residents want to stay?', array['To inconvenience residents unnecessarily', 'Because rescue becomes far more dangerous once floodwaters rise further, and early evacuation protects lives', 'Because it’s standard procedure with no real safety reasoning', 'Evacuation orders are optional and rarely necessary']::text[], 1),
  ('post-fl5', 'post-assessment', 'Flood', 'Flood', 'What is a practical way to reduce flood risk to important documents and valuables before flood season?', array['Leave them on the floor for easy access', 'Store them in a waterproof container and keep copies or digital backups', 'Assume documents don’t need any special protection', 'Only protect documents during the flood itself, not beforehand']::text[], 1),
  ('post-gen1', 'post-assessment', 'General', 'General Preparedness', 'Based on what you practiced in LIG+AS, which best describes an effective household disaster plan?', array['A plan that only covers what to do during the disaster itself', 'A plan covering prevention, response during the event, AND recovery afterward, practiced regularly by the whole household', 'A plan that is created once and never needs to be updated', 'A plan that only one family member needs to know in detail']::text[], 1),
  ('post-gen2', 'post-assessment', 'General', 'General Preparedness', 'Now that you’ve played LIG+AS, what is the value of practicing disaster response in a simulation before a real event?', array['Simulations have no real value since they aren’t real emergencies', 'It builds familiarity and faster, calmer decision-making that can carry over to real situations', 'It’s only useful for entertainment purposes', 'It replaces the need for any real household emergency plan']::text[], 1),
  ('post-gen3', 'post-assessment', 'General', 'General Preparedness', 'Which best describes how often a household emergency plan should be reviewed?', array['Only once, when it is first created', 'Regularly — e.g., whenever household members, risks, or circumstances change', 'Never, since plans don’t need updates', 'Only after a disaster has already occurred']::text[], 1),
  ('post-gen4', 'post-assessment', 'General', 'General Preparedness', 'A classmate says disaster preparedness is "just common sense" and doesn’t need practice. What is the best response, based on what you’ve learned?', array['Agree — no practice is needed', 'Explain that stress during real emergencies can impair decision-making, so practiced responses matter', 'Ignore the comment since it doesn’t matter', 'Preparedness only matters for emergency responders, not regular people']::text[], 1),
  ('post-gen5', 'post-assessment', 'General', 'General Preparedness', 'Which of these best reflects a complete household emergency kit, based on what LIG+AS emphasizes?', array['Only a flashlight, since light is the most important resource', 'Water, food, first aid supplies, important documents, a flashlight, and a way to communicate', 'Entertainment items only, to stay calm during a disaster', 'No kit is needed if you plan to evacuate immediately']::text[], 1)
on conflict (legacy_id) do nothing;

notify pgrst, 'reload schema';
