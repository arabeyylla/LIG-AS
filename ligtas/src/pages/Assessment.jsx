import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Toast from '../components/Toast';
import AssessmentGuidanceModal from '../components/AssessmentGuidanceModal';
import AssessmentHome from '../components/assessment/AssessmentHome';
import CategorySelector from '../components/assessment/CategorySelector';
import AssessmentQuiz from '../components/assessment/AssessmentQuiz';
import GameSessionView from '../components/assessment/GameSessionView';
import { trackPageVisit } from '../lib/analytics';
import { logSystemEvent } from '../lib/systemLogs';
import { fetchCategoryQuestions, pickCategoryQuestions } from '../lib/assessmentQuestionBank';
import { getSession, submitPreTest, submitPostTest } from '../lib/assessmentSessions';
import {
  getCategory,
  QUESTIONS_PER_ATTEMPT_KEY,
  DEFAULT_QUESTIONS_PER_ATTEMPT,
  normalizeQuestionCount,
} from '../lib/assessmentCategories';
import { loadStoredConsent, saveStoredConsent, loadSavedGameCode, saveGameCode } from '../lib/assessmentLocalStore';
import { useSiteSetting } from '../hooks/useSiteSetting';
import { useConfirm } from '../hooks/useConfirm';
import { ArrowLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

// ---------------------------------------------------------------------------
// Assessment page — a multi-step flow that stays on the /assessment route.
//
//   home      "Start Pre-Test"  or  "Resume / Enter Code"
//   category  choose a disaster module (Pre-Test only)
//             -> guidance + data-privacy modal (Start Assessment)
//   quiz      the randomized questions (Pre-Test, or Post-Test for a session)
//   session   everything tied to one Game Code: the code + waiting screen, the
//             Post-Test unlock, and the final results (see GameSessionView)
//
// Pre-Test submit creates the session and its Game Code; the mobile app
// uploads the game evaluation; the Post-Test unlocks; the final report shows.
// This component only owns navigation state — each step's UI lives in
// src/components/assessment/*, and all database access goes through the RPC
// wrappers in src/lib/assessmentSessions.js.
// ---------------------------------------------------------------------------

const STEP = { HOME: 'home', CATEGORY: 'category', QUIZ: 'quiz', SESSION: 'session' };
const TYPE_LABEL = { pre: 'Pre-Test', post: 'Post-Test' };

export default function Assessment() {
  const [step, setStep] = useState(STEP.HOME);
  const [type, setType] = useState('pre'); // 'pre' | 'post' — which test the quiz step is running
  const [categoryId, setCategoryId] = useState(null); // module currently being tested
  const [pendingCategoryId, setPendingCategoryId] = useState(null); // picked, waiting on the guidance modal
  const [gameCode, setGameCode] = useState(null); // active session, once there is one

  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [attemptId, setAttemptId] = useState(0); // bumped per attempt so AssessmentQuiz remounts with fresh state

  // Kept in page state only to prefill the certificate name; the database
  // never returns it to the browser.
  const [participantId, setParticipantId] = useState('');
  const [consentGiven, setConsentGiven] = useState(() => loadStoredConsent());
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }

  const { confirm, confirmDialog } = useConfirm();
  const { value: perAttemptSetting } = useSiteSetting(QUESTIONS_PER_ATTEMPT_KEY, DEFAULT_QUESTIONS_PER_ATTEMPT);

  // Guards against a slow question fetch finishing after the player already
  // backed out or started something else.
  const loadRequestRef = useRef(0);

  const category = categoryId ? getCategory(categoryId) : null;
  const pendingCategory = pendingCategoryId ? getCategory(pendingCategoryId) : null;

  useEffect(() => {
    trackPageVisit('assessment');
  }, []);

  useEffect(() => { saveStoredConsent(consentGiven); }, [consentGiven]);

  // --- Session entry points ----------------------------------------------------

  function openSession(code) {
    setGameCode(code);
    saveGameCode(code);
    setStep(STEP.SESSION);
  }

  /** "Resume / Enter Code": confirm the code exists before leaving the home screen. */
  async function resumeSession(code) {
    const result = await getSession(code);
    if (result.ok) openSession(result.game_code);
    return result;
  }

  function startPreTest() {
    setType('pre');
    setStep(STEP.CATEGORY);
  }

  /** From an unlocked session: go straight to that module's Post-Test (via the guidance modal). */
  function startPostTest(session) {
    setType('post');
    setPendingCategoryId(session.module);
  }

  // --- Quiz lifecycle ----------------------------------------------------------

  async function startAssessment() {
    const id = pendingCategoryId;
    if (!id) return;
    const requestId = ++loadRequestRef.current;

    setPendingCategoryId(null);
    setCategoryId(id);
    setQuestions([]);
    setAttemptId((n) => n + 1);
    setLoadingQuestions(true);
    setStep(STEP.QUIZ);

    // Fresh random draw for every attempt.
    const pool = await fetchCategoryQuestions(type, id);
    if (requestId !== loadRequestRef.current) return;
    setQuestions(pickCategoryQuestions(pool, normalizeQuestionCount(perAttemptSetting)));
    setLoadingQuestions(false);
  }

  /** Sends the scored answers to the right RPC for the current test. */
  async function submitAssessment({ identifier, score, total, answers, confidence }) {
    const result =
      type === 'pre'
        ? await submitPreTest({ module: categoryId, identifier, score, total, answers, likert: confidence })
        : await submitPostTest({ gameCode, score, total, answers, likert: confidence });

    if (result.ok) {
      logSystemEvent(
        'assessment.submitted',
        { type, category: categoryId, score, total, gameCode: type === 'pre' ? result.game_code : gameCode },
        'assessment_sessions',
        type === 'pre' ? result.game_code : gameCode
      );
    }
    return result;
  }

  function handleSubmitted(result) {
    setToast({ type: 'success', message: `${TYPE_LABEL[type]} submitted successfully!` });
    openSession(type === 'pre' ? result.game_code : gameCode);
  }

  // --- Navigation --------------------------------------------------------------

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
    if (step === STEP.QUIZ) setStep(type === 'post' ? STEP.SESSION : STEP.CATEGORY);
    else setStep(STEP.HOME);
  }

  // --- Render ---------------------------------------------------------------

  const showBreadcrumb = step !== STEP.HOME;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO */}
      <section className="relative bg-[#0a1120] text-white py-20 sm:py-28 lg:py-32 overflow-hidden print:hidden">
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
            Take the Pre-Test, play the matching scenario in the LIG+AS mobile app with your Game Code,
            then return for the Post-Test to see how much you've learned.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-16 sm:py-24 bg-white print:py-0 print:bg-white">
        <div className="px-4 sm:px-6 lg:px-[4%] max-w-6xl mx-auto">
          {showBreadcrumb && (
            <nav aria-label="Assessment progress" className="flex items-center flex-wrap gap-2 mb-8 text-sm font-bold print:hidden">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
              >
                <ArrowLeft size={14} /> {step === STEP.QUIZ && type === 'post' ? 'Back to session' : 'Back'}
              </button>
              {step === STEP.SESSION ? (
                <span className="text-slate-800 font-black">Game session</span>
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
            <AssessmentHome onStartPreTest={startPreTest} onResume={resumeSession} initialCode={loadSavedGameCode()} />
          )}

          {step === STEP.CATEGORY && <CategorySelector onSelect={setPendingCategoryId} />}

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
                  There are no {TYPE_LABEL[type]} questions for {category?.label} yet. Please contact an administrator.
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
                showParticipantField={type === 'pre'}
                consentGiven={consentGiven}
                onSubmit={submitAssessment}
                onSubmitted={handleSubmitted}
              />
            ))}

          {step === STEP.SESSION && gameCode && (
            <GameSessionView
              key={gameCode}
              gameCode={gameCode}
              participantName={participantId}
              onStartPostTest={startPostTest}
              onNewSession={startPreTest}
              onChangeCode={() => setStep(STEP.HOME)}
            />
          )}
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
