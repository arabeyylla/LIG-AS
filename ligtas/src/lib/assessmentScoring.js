// Shared scoring/feedback helpers and self-evaluation copy for the public
// Assessment flow (result screen, quiz form, local results view).

export const CONFIDENCE_LABELS = [
  'Not at all confident',
  'Slightly confident',
  'Moderately confident',
  'Very confident',
  'Extremely confident',
];

/** Likert prompt, phrased for the category being tested (see `situation` in assessmentCategories.js). */
export function confidenceQuestion(category) {
  return `On a scale of 1 to 5, how confident are you in your ability to respond to ${category.situation}?`;
}

export function percentOf(score, total) {
  if (!total) return 0;
  return Math.round((score / total) * 100);
}

export function getFeedback(percent) {
  if (percent >= 80) {
    return { label: 'Excellent!', message: 'You have a strong understanding of disaster preparedness. Keep it up!' };
  }
  if (percent >= 50) {
    return { label: 'Good effort!', message: 'You know the basics — a bit more practice will make you even more prepared.' };
  }
  return { label: 'Keep learning!', message: 'This is a great starting point. Dive into LIG+AS to strengthen your disaster readiness skills.' };
}
