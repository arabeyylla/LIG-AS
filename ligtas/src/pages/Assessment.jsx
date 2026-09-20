import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Toast from '../components/Toast';
import AssessmentGuidanceModal from '../components/AssessmentGuidanceModal';
import AssessmentTypeSelector from '../components/assessment/AssessmentTypeSelector';
import CategorySelector from '../components/assessment/CategorySelector';
import AssessmentQuiz from '../components/assessment/AssessmentQuiz';
import AssessmentResultView from '../components/assessment/AssessmentResultView';
import LocalResultsView from '../components/assessment/LocalResultsView';
import { trackPageVisit } from '../lib/analytics';
import { fetchCategoryQuestions, pickCategoryQuestions } from '../lib/assessmentQuestionBank';
import {
  getCategory,
  QUESTIONS_PER_ATTEMPT_KEY,
  DEFAULT_QUESTIONS_PER_ATTEMPT,
  normalizeQuestionCount,
} from '../lib/assessmentCategories';
import { loadLocalResults, saveLocalResult, loadStoredConsent, saveStoredConsent } from '../lib/assessmentLocalStore';
import { useSiteSetting } from '../hooks/useSiteSetting';
import { useConfirm } from '../hooks/useConfirm';
import { ArrowLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

// ---------------------------------------------------------------------------
// Assessment page — a multi-step flow that stays on the /assessment route.
//
//   home      choose Pre- or Post-Assessment (or "My results")
//   category  choose a disaster category
//             -> guidance + data-privacy modal (Start Assessment)
//   quiz      the randomized questions for that category
//   result    score + Pre/Post comparison
//   results   this device's saved results, per category
//
// This component only owns navigation state; each step's UI lives in
// src/components/assessment/*.
// ---------------------------------------------------------------------------

const STEP = { HOME: 'home', CATEGORY: 'category', QUIZ: 'quiz', RESULT: 'result', RESULTS: 'results' };
const TYPE_LABEL = { pre: 'Pre-Assessment', post: 'Post-Assessment' };

export default function Assessment() {
  const [step, setStep] = useState(STEP.HOME);
  const [type, setType] = useState(null); // 'pre' | 'post'
  const [categoryId, setCategoryId] = useState(null); // category currently being taken
  const [pendingCategoryId, setPendingCategoryId] = useState(null); // picked, waiting on the guidance modal

  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [attemptId, setAttemptId] = useState(0); // bumped per attempt so AssessmentQuiz remounts with fresh state
  const [result, setResult] = useState(null); // { type, category, score, total, confidence, submittedAt }

  // Pre-filled from this session's cache so a returning player (e.g. taking the Post-Assessment) doesn't retype it.
  const [participantId, setParticipantId] = useState(() => loadLocalResults().participantId);
  const [consentGiven, setConsentGiven] = useState(() => loadStoredConsent());
  const [localResults, setLocalResults] = useState(() => loadLocalResults());
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }

  const { confirm, confirmDialog } = useConfirm();
  const { value: perAttemptSetting } = useSiteSetting(QUESTIONS_PER_ATTEMPT_KEY, DEFAULT_QUESTIONS_PER_ATTEMPT);

  // Guards against a slow question fetch finishing after the player already
  // backed out or started a different category.
  const loadRequestRef = useRef(0);

  const category = categoryId ? getCategory(categoryId) : null;
  const pendingCategory = pendingCategoryId ? getCategory(pendingCategoryId) : null;

  useEffect(() => {
    trackPageVisit('assessment');
  }, []);

  useEffect(() => { saveStoredConsent(consentGiven); }, [consentGiven]);

  // --- Navigation -----------------------------------------------------------

  function chooseType(nextType) {
    setType(nextType);
    setStep(STEP.CATEGORY);
  }

  /** Category card clicked: don't start yet — the guidance/consent modal comes first. */
  function chooseCategory(id) {
    setPendingCategoryId(id);
  }

  async function startAssessment() {
    const id = pendingCategoryId;
    if (!id || !type) return;
    const requestId = ++loadRequestRef.current;

    setPendingCategoryId(null);
    setCategoryId(id);
    setResult(null);
    setQuestions([]);
    setAttemptId((n) => n + 1);
    setLoadingQuestions(true);
    setStep(STEP.QUIZ);

    // Fresh random draw for every attempt (including retakes).
    const pool = await fetchCategoryQuestions(type, id);
    if (requestId !== loadRequestRef.current) return;
    setQuestions(pickCategoryQuestions(pool, normalizeQuestionCount(perAttemptSetting)));
    setLoadingQuestions(false);
  }

  async function handleBack() {
    if (step === STEP.QUIZ && !loadingQuestions && questions.length > 0) {
      const ok = await confirm({
        title: 'Leave this assessment?',
        message: 'Your answers for this attempt will be lost.',
        confirmLabel: 'Leave',
      });
      if (!ok) return;
    }
    loadRequestRef.current++; // cancel any in-flight question fetch
    setLoadingQuestions(false);
    setStep(step === STEP.QUIZ ? STEP.CATEGORY : STEP.HOME);
  }

  function handleSubmitted(payload) {
    const nextLocal = saveLocalResult(participantId.trim(), payload.category, payload);
    if (nextLocal) setLocalResults(nextLocal);
    setResult(payload);
    setStep(STEP.RESULT);
  }

  function handleRetake() {
    setPendingCategoryId(categoryId); // straight back to the guidance modal for the same category
    setStep(STEP.CATEGORY);
  }

  function goToPostAssessment() {
    setType('post');
    setStep(STEP.CATEGORY);
  }

  // --- Render ---------------------------------------------------------------

  const showBreadcrumb = step === STEP.CATEGORY || step === STEP.QUIZ || step === STEP.RESULTS;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO */}
      <section className="relative bg-[#0a1120] text-white py-20 sm:py-28 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a1120]"></div>
        <div className="absolute inset-0 bg-orange-500/5" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)' }}></div>

        <div className="relative z-10 px-4 sm:px-8 lg:px-[6%] text-center">
          <div className="inline-block px-4 py-1.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            Knowledge Check
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-tight">
            Disaster Preparedness <span className="text-orange-500">Assessment</span>
          </h1>
          <p className="mt-6 text-base sm:text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Choose a disaster category and take the Pre-Assessment before you play, then come back for the
            Post-Assessment afterward to see how much you've learned.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="px-4 sm:px-6 lg:px-[4%] max-w-6xl mx-auto">
          {showBreadcrumb && (
            <nav aria-label="Assessment progress" className="flex items-center flex-wrap gap-2 mb-8 text-sm font-bold">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
              >
                <ArrowLeft size={14} /> Back
              </button>
              {step === STEP.RESULTS ? (
                <span className="text-slate-800 font-black">My results</span>
              ) : (
                <>
                  <span className={step === STEP.CATEGORY ? 'text-slate-800 font-black' : 'text-slate-400'}>{TYPE_LABEL[type]}</span>
                  {step === STEP.QUIZ && category && (
                    <>
                      <ChevronRight size={14} className="text-slate-300" />
                      <span className="text-slate-800 font-black">
                        <span aria-hidden="true">{category.emoji}</span> {category.label}
                      </span>
                    </>
                  )}
                </>
              )}
            </nav>
          )}

          {step === STEP.HOME && (
            <AssessmentTypeSelector onSelectType={chooseType} onViewResults={() => setStep(STEP.RESULTS)} />
          )}

          {step === STEP.CATEGORY && <CategorySelector type={type} onSelect={chooseCategory} />}

          {step === STEP.QUIZ &&
            (loadingQuestions ? (
              <div className="flex flex-col items-center py-20 text-slate-400 gap-4">
                <Loader2 className="animate-spin" size={36} />
                <p className="font-bold text-sm">Preparing your {category?.label} questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
                <AlertCircle className="text-orange-300 mx-auto mb-4" size={40} />
                <h3 className="text-lg font-black text-slate-800 mb-1">No questions available</h3>
                <p className="text-sm font-medium text-gray-500">
                  There are no {TYPE_LABEL[type]} questions for {category?.label} yet. Please pick another category.
                </p>
              </div>
            ) : (
              <AssessmentQuiz
                key={attemptId}
                type={type}
                category={category}
                questions={questions}
                participantId={participantId}
                onParticipantIdChange={setParticipantId}
                consentGiven={consentGiven}
                onSubmitted={handleSubmitted}
                onToast={(toastType, message) => setToast({ type: toastType, message })}
              />
            ))}

          {step === STEP.RESULT && result && (
            <AssessmentResultView
              result={result}
              category={getCategory(result.category)}
              localResults={localResults}
              onRetake={handleRetake}
              onAnotherCategory={() => setStep(STEP.CATEGORY)}
              onGoToPost={goToPostAssessment}
              onGoToResults={() => setStep(STEP.RESULTS)}
            />
          )}

          {step === STEP.RESULTS && <LocalResultsView localResults={localResults} onStart={() => setStep(STEP.HOME)} />}
        </div>
      </section>

      <Footer />

      {pendingCategory && (
        <AssessmentGuidanceModal
          type={type}
          category={pendingCategory}
          consentGiven={consentGiven}
          onConsentChange={setConsentGiven}
          onConfirm={startAssessment}
          onCancel={() => setPendingCategoryId(null)}
        />
      )}

      {confirmDialog}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
