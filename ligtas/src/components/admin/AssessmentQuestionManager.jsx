import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { logSystemEvent } from '../../lib/systemLogs';
import { useAssessmentQuestions } from '../../hooks/useAssessmentQuestions';
import { useSiteSetting } from '../../hooks/useSiteSetting';
import { useConfirm } from '../../hooks/useConfirm';
import { useToast } from '../../hooks/useToast';
import {
  ASSESSMENT_CATEGORIES,
  ENABLED_CATEGORIES_KEY,
  DEFAULT_ENABLED_CATEGORIES,
  QUESTIONS_PER_ATTEMPT_KEY,
  DEFAULT_QUESTIONS_PER_ATTEMPT,
  getCategory,
  isCategoryEnabled,
  normalizeQuestionCount,
} from '../../lib/assessmentCategories';
import { Plus, Edit3, Trash2, Loader2, Eye, EyeOff, Search, HelpCircle, LayoutGrid, Save, X, CheckCircle2, AlertTriangle } from 'lucide-react';

const EMPTY_FORM = {
  assessment_type: 'pre-assessment',
  module: 'Earthquake',
  question: '',
  options: ['', '', '', ''],
  correct_index: 0,
  is_active: true,
};

/**
 * "Question Bank" sub-tab of the admin Assessment Results page. Lets an
 * admin:
 *   - filter questions by Category (Earthquake, Typhoon, ...) and Assessment
 *     Type (Pre vs. Post), with the list grouped by category,
 *   - add/edit/delete questions and their choices,
 *   - exclude individual questions from the public site,
 *   - show/hide whole categories on the public category picker and set how
 *     many questions each attempt draws (see CategorySettings below).
 *
 * The public Assessment page (src/pages/Assessment.jsx) reads the same
 * `assessment_questions` table via fetchCategoryQuestions() and falls back to
 * the built-in static bank only if Supabase can't be reached.
 */
export default function AssessmentQuestionManager() {
  const { questions, loading, removeLocal } = useAssessmentQuestions();
  const { confirm, confirmDialog } = useConfirm();
  const { showToast, toastElement } = useToast();

  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const filteredQuestions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return questions.filter((q) => {
      if (typeFilter !== 'all' && q.assessment_type !== typeFilter) return false;
      if (categoryFilter !== 'all' && q.module !== categoryFilter) return false;
      const active = q.is_active ?? true;
      if (activeFilter === 'active' && !active) return false;
      if (activeFilter === 'inactive' && active) return false;
      if (needle && !q.question.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [questions, typeFilter, categoryFilter, activeFilter, search]);

  // Filtered questions grouped by category (in the picker's display order),
  // Pre before Post inside each group. Questions saved under a category that
  // is no longer configured (e.g. the retired 'Flood' questions) get their own
  // trailing group so they can still be reviewed or deleted.
  const groupedQuestions = useMemo(() => {
    const knownIds = new Set(ASSESSMENT_CATEGORIES.map((c) => c.id));
    const legacyIds = [...new Set(filteredQuestions.map((q) => q.module).filter((id) => !knownIds.has(id)))];
    return [...ASSESSMENT_CATEGORIES, ...legacyIds.map(getCategory)]
      .map((category) => ({
        category,
        items: filteredQuestions
          .filter((q) => q.module === category.id)
          .sort((a, b) => b.assessment_type.localeCompare(a.assessment_type)),
      }))
      .filter((group) => group.items.length > 0);
  }, [filteredQuestions]);

  function validateForm() {
    if (!formData.question.trim()) return 'Please enter the question text.';
    if (formData.options.some((o) => !o.trim())) return 'Please fill in all 4 choices.';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) { showToast(validationError, 'error'); return; }
    if (!supabase) { showToast('Backend not configured.', 'error'); return; }

    setSubmitting(true);
    try {
      const payload = {
        assessment_type: formData.assessment_type,
        module: formData.module,
        category: getCategory(formData.module).label, // display label; `module` holds the category id
        question: formData.question.trim(),
        options: formData.options.map((o) => o.trim()),
        correct_index: formData.correct_index,
        is_active: formData.is_active,
      };

      if (editingId) {
        const { error } = await supabase.from('assessment_questions').update(payload).eq('id', editingId);
        if (error) throw error;
        logSystemEvent('assessment_question.updated', { module: payload.module }, 'assessment_questions', editingId);
      } else {
        const { error } = await supabase.from('assessment_questions').insert(payload);
        if (error) throw error;
        logSystemEvent('assessment_question.created', { module: payload.module }, 'assessment_questions');
      }

      const wasEditing = Boolean(editingId);
      setFormData(EMPTY_FORM);
      setShowForm(false);
      setEditingId(null);
      showToast(wasEditing ? 'Question updated.' : 'Question added to the bank.', 'success');
    } catch (err) {
      console.error('Failed to save question:', err.message);
      showToast('Failed to save: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(q) {
    const ok = await confirm({
      title: 'Delete this question?',
      message: 'It will be permanently removed from the bank and will no longer be drawn into future assessments. This cannot be undone.',
      confirmLabel: 'Delete Question',
    });
    if (!ok) return;

    setDeletingId(q.id);
    try {
      const { error } = await supabase.from('assessment_questions').delete().eq('id', q.id);
      if (error) throw error;
      removeLocal(q.id);
      logSystemEvent('assessment_question.deleted', {}, 'assessment_questions', q.id);
      showToast('Question deleted.', 'success');
    } catch (err) {
      console.error('Failed to delete question:', err.message);
      showToast('Failed to delete: ' + err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleActive(q) {
    const nextActive = !(q.is_active ?? true);
    setTogglingId(q.id);
    try {
      const { error } = await supabase.from('assessment_questions').update({ is_active: nextActive }).eq('id', q.id);
      if (error) throw error;
      logSystemEvent(nextActive ? 'assessment_question.enabled' : 'assessment_question.disabled', {}, 'assessment_questions', q.id);
      showToast(nextActive ? 'Question is eligible to appear on the site again.' : 'Question excluded from future assessments.', 'success');
    } catch (err) {
      console.error('Failed to update question:', err.message);
      showToast('Failed to update: ' + err.message, 'error');
    } finally {
      setTogglingId(null);
    }
  }

  function handleEdit(q) {
    setFormData({
      assessment_type: q.assessment_type,
      module: q.module,
      question: q.question,
      options: [...q.options],
      correct_index: q.correct_index,
      is_active: q.is_active ?? true,
    });
    setEditingId(q.id);
    setShowForm(false);
  }

  function handleCancelEdit() {
    setFormData(EMPTY_FORM);
    setEditingId(null);
  }

  function handleStartNew() {
    setEditingId(null);
    // Pre-select whatever the admin is currently filtering by.
    setFormData({
      ...EMPTY_FORM,
      assessment_type: typeFilter !== 'all' ? typeFilter : EMPTY_FORM.assessment_type,
      module: categoryFilter !== 'all' ? categoryFilter : EMPTY_FORM.module,
    });
    setShowForm(true);
  }

  function handleCancelNew() {
    setFormData(EMPTY_FORM);
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <CategorySettings questions={questions} showToast={showToast} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-black text-slate-800 text-lg">All Questions ({questions.length})</h3>
        {!showForm && (
          <button onClick={handleStartNew} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20">
            <Plus size={16} /> Add Question
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Type</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black uppercase tracking-wide text-slate-600 outline-none cursor-pointer">
            <option value="all">All Types</option>
            <option value="pre-assessment">Pre-Assessment</option>
            <option value="post-assessment">Post-Assessment</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Category</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black uppercase tracking-wide text-slate-600 outline-none cursor-pointer">
            <option value="all">All Categories</option>
            {ASSESSMENT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Status</label>
          <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black uppercase tracking-wide text-slate-600 outline-none cursor-pointer">
            <option value="all">All</option>
            <option value="active">Eligible / Active</option>
            <option value="inactive">Excluded</option>
          </select>
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search question text..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-orange-400"
          />
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3"><HelpCircle className="text-orange-500" size={22} /><h3 className="font-black text-slate-800 text-lg">Add Question</h3></div>
            <button onClick={handleCancelNew} className="text-slate-400 hover:text-slate-800 transition-colors"><X size={20} /></button>
          </div>
          <QuestionFormFields formData={formData} setFormData={setFormData} onSubmit={handleSubmit} submitting={submitting} onCancel={handleCancelNew} submitLabel="Add Question" />
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center py-16 text-slate-400 gap-3"><Loader2 className="animate-spin" size={32} /><p className="font-bold text-sm">Loading question bank...</p></div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
            <HelpCircle className="text-slate-200 mx-auto mb-3" size={40} />
            <p className="text-slate-400 font-bold text-sm">
              {questions.length === 0 ? 'No questions in the database yet. Add some here so players can take the assessment.' : 'No questions match your filters.'}
            </p>
          </div>
        ) : (
          groupedQuestions.map(({ category, items }) => (
            <section key={category.id} className="space-y-3">
              <h4 className="flex items-center gap-2 pt-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                <span aria-hidden="true" className="text-base">{category.emoji}</span> {category.label}
                <span className="text-slate-300">&middot; {items.length} question{items.length !== 1 ? 's' : ''}</span>
              </h4>
              {items.map((q) => {
                // Inline edit: this card becomes the edit form in place.
                if (editingId === q.id) {
                  return (
                    <div key={q.id} className="bg-white rounded-2xl border-2 border-orange-300 p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-5"><Edit3 className="text-orange-500" size={18} /><h4 className="font-black text-slate-800">Editing Question</h4></div>
                      <QuestionFormFields formData={formData} setFormData={setFormData} onSubmit={handleSubmit} submitting={submitting} onCancel={handleCancelEdit} submitLabel="Update Question" />
                    </div>
                  );
                }

                const active = q.is_active ?? true;
                return (
                  <div key={q.id} className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${active ? 'border-slate-100' : 'border-slate-100 opacity-60'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-md ${q.assessment_type === 'pre-assessment' ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-600'}`}>
                            {q.assessment_type === 'pre-assessment' ? 'Pre' : 'Post'}
                          </span>
                          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black uppercase rounded-md">{getCategory(q.module).label}</span>
                          {!active && <span className="px-2.5 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-md">Excluded</span>}
                        </div>
                        <p className="font-bold text-slate-800 text-sm mb-2">{q.question}</p>
                        <div className="grid sm:grid-cols-2 gap-1.5">
                          {q.options.map((opt, idx) => (
                            <div key={idx} className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg ${idx === q.correct_index ? 'bg-green-50 text-green-700 font-bold' : 'bg-slate-50 text-slate-500'}`}>
                              {idx === q.correct_index && <CheckCircle2 size={12} className="flex-shrink-0" />}
                              <span className="truncate">{String.fromCharCode(65 + idx)}. {opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleActive(q)}
                          disabled={togglingId === q.id}
                          className={`p-2.5 rounded-xl transition-colors disabled:opacity-50 ${active ? 'bg-slate-100 hover:bg-slate-200 text-slate-500' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                          title={active ? 'Exclude from future assessments' : 'Make eligible again'}
                        >
                          {togglingId === q.id ? <Loader2 size={16} className="animate-spin" /> : active ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button onClick={() => handleEdit(q)} className="p-2.5 bg-slate-100 hover:bg-blue-500 hover:text-white text-slate-500 rounded-xl transition-colors" title="Edit"><Edit3 size={16} /></button>
                        <button onClick={() => handleDelete(q)} disabled={deletingId === q.id} className="p-2.5 bg-slate-100 hover:bg-red-500 hover:text-white text-slate-500 rounded-xl transition-colors disabled:opacity-50" title="Delete">
                          {deletingId === q.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          ))
        )}
      </div>

      {confirmDialog}
      {toastElement}
    </div>
  );
}

// Shared form fields for both the top "Add Question" panel and the inline
// "Edit" form rendered in place of a list item.
function QuestionFormFields({ formData, setFormData, onSubmit, submitting, onCancel, submitLabel }) {
  function updateOption(idx, value) {
    setFormData((prev) => {
      const options = [...prev.options];
      options[idx] = value;
      return { ...prev, options };
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assessment Type</label>
          <select value={formData.assessment_type} onChange={(e) => setFormData({ ...formData, assessment_type: e.target.value })} className="w-full p-3.5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-xl font-bold text-slate-800 outline-none transition-all appearance-none">
            <option value="pre-assessment">Pre-Assessment</option>
            <option value="post-assessment">Post-Assessment</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
          <select value={formData.module} onChange={(e) => setFormData({ ...formData, module: e.target.value })} className="w-full p-3.5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-xl font-bold text-slate-800 outline-none transition-all appearance-none">
            {ASSESSMENT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
            {/* Editing a legacy question: keep its retired category selectable so the form doesn't silently show another one. */}
            {!ASSESSMENT_CATEGORIES.some((c) => c.id === formData.module) && (
              <option value={formData.module}>{formData.module} (retired)</option>
            )}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Question</label>
        <textarea value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} rows={3} placeholder="Type the question..." className="w-full p-3.5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-xl font-bold text-slate-800 outline-none transition-all resize-none" required />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Choices — click a letter to mark the correct answer</label>
        <div className="space-y-2.5">
          {formData.options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isCorrect = formData.correct_index === idx;
            return (
              <div key={idx} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, correct_index: idx }))}
                  className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black transition-all ${isCorrect ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                  title={isCorrect ? 'Correct answer' : 'Mark as correct answer'}
                >
                  {letter}
                </button>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  placeholder={`Choice ${letter}`}
                  className={`flex-1 p-3 bg-slate-50 border-2 rounded-xl font-bold text-sm text-slate-800 outline-none focus:border-orange-500 transition-all ${isCorrect ? 'border-green-200' : 'border-transparent'}`}
                  required
                />
              </div>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl cursor-pointer w-fit">
        <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 accent-orange-500" />
        <span className="text-sm font-bold text-slate-700">Eligible to appear on the site</span>
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="px-8 py-3 border-2 border-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Cancel</button>
      </div>
    </form>
  );
}

// Admin controls for the public category picker, stored in `site_settings`:
//   assessment_enabled_categories     { [categoryId]: boolean } — which
//                                     category cards players can see
//   assessment_questions_per_attempt  how many questions each attempt draws
// The coverage line under each category shows how many ACTIVE questions it has
// per assessment type, so an admin can see at a glance whether a category is
// ready to be switched on. Toggles save immediately; the per-attempt number
// has its own Save button.
function CategorySettings({ questions, showToast }) {
  const { value: enabledMap, save: saveEnabled, loading: enabledLoading } = useSiteSetting(ENABLED_CATEGORIES_KEY, DEFAULT_ENABLED_CATEGORIES);
  const { value: perAttemptSetting, save: savePerAttempt, loading: perAttemptLoading } = useSiteSetting(QUESTIONS_PER_ATTEMPT_KEY, DEFAULT_QUESTIONS_PER_ATTEMPT);
  const perAttempt = normalizeQuestionCount(perAttemptSetting);

  const [countDraft, setCountDraft] = useState(perAttempt);
  const [savingCount, setSavingCount] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => { setCountDraft(perAttempt); }, [perAttempt]);

  // { [categoryId]: { pre, post } } — active question counts.
  const activeCounts = useMemo(() => {
    const counts = Object.fromEntries(ASSESSMENT_CATEGORIES.map((c) => [c.id, { pre: 0, post: 0 }]));
    questions.forEach((q) => {
      if (!(q.is_active ?? true) || !counts[q.module]) return;
      counts[q.module][q.assessment_type === 'pre-assessment' ? 'pre' : 'post'] += 1;
    });
    return counts;
  }, [questions]);

  async function toggleCategory(category) {
    const nextEnabled = !isCategoryEnabled(enabledMap, category.id);
    setTogglingId(category.id);
    const { error } = await saveEnabled({ ...DEFAULT_ENABLED_CATEGORIES, ...enabledMap, [category.id]: nextEnabled });
    setTogglingId(null);
    if (error) {
      showToast('Failed to update category: ' + error.message, 'error');
      return;
    }
    logSystemEvent(nextEnabled ? 'assessment_category.enabled' : 'assessment_category.disabled', { category: category.id }, 'site_settings', ENABLED_CATEGORIES_KEY);
    showToast(`${category.label} is now ${nextEnabled ? 'visible to' : 'hidden from'} players.`, 'success');
  }

  async function handleSaveCount() {
    const next = normalizeQuestionCount(countDraft);
    setSavingCount(true);
    const { error } = await savePerAttempt(next);
    setSavingCount(false);
    if (error) {
      showToast('Failed to save setting: ' + error.message, 'error');
      return;
    }
    logSystemEvent('assessment_settings.questions_per_attempt', { value: next }, 'site_settings', QUESTIONS_PER_ATTEMPT_KEY);
    showToast(`Each attempt will now draw up to ${next} questions.`, 'success');
  }

  const countDirty = normalizeQuestionCount(countDraft) !== perAttempt;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <LayoutGrid className="text-orange-500" size={22} />
        <h3 className="font-black text-slate-800 text-lg">Category Settings</h3>
      </div>
      <p className="text-sm text-slate-400 mb-6">
        Choose which disaster categories players can pick on the public Assessment page. Each attempt draws random questions
        from one category, with answer choices shuffled every time.
      </p>

      <div className="divide-y divide-slate-50 mb-6">
        {ASSESSMENT_CATEGORIES.map((category) => {
          const enabled = isCategoryEnabled(enabledMap, category.id);
          const { pre, post } = activeCounts[category.id];
          const missing = [pre === 0 && 'Pre', post === 0 && 'Post'].filter(Boolean);
          const short = Math.min(pre, post) < perAttempt;
          return (
            <div key={category.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
              <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                <span className="text-2xl" aria-hidden="true">{category.emoji}</span>
                <div>
                  <p className="font-black text-slate-800 text-sm">{category.label}</p>
                  <p className="text-xs font-bold text-slate-400">
                    {pre} Pre &middot; {post} Post active question{pre + post !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {enabled && short && (
                <p className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                  <AlertTriangle size={13} className="flex-shrink-0" />
                  {missing.length > 0
                    ? `No ${missing.join(' or ')} questions — players cannot start ${missing.length > 1 ? 'either assessment' : 'that assessment'}.`
                    : `Under ${perAttempt} questions — attempts will use all that are available.`}
                </p>
              )}

              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={`${enabled ? 'Hide' : 'Show'} ${category.label} on the public site`}
                onClick={() => toggleCategory(category)}
                disabled={enabledLoading || togglingId === category.id}
                className="flex items-center gap-3 disabled:opacity-50"
              >
                <span className={`text-xs font-black uppercase tracking-wider w-14 text-right ${enabled ? 'text-green-600' : 'text-slate-400'}`}>
                  {enabled ? 'Visible' : 'Hidden'}
                </span>
                <span className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-slate-200'}`}>
                  {togglingId === category.id ? (
                    <Loader2 size={14} className="animate-spin absolute top-1 left-1/2 -translate-x-1/2 text-white" />
                  ) : (
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${enabled ? 'left-[1.375rem]' : 'left-0.5'}`} />
                  )}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-end justify-between flex-wrap gap-4 pt-6 border-t border-slate-100">
        <div>
          <label htmlFor="questions-per-attempt" className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">
            Questions per attempt
          </label>
          <input
            id="questions-per-attempt"
            type="number"
            min={1}
            max={50}
            value={countDraft}
            onChange={(e) => setCountDraft(e.target.value)}
            className="w-28 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-800 outline-none focus:border-orange-500 transition-all"
          />
        </div>
        <button
          onClick={handleSaveCount}
          disabled={!countDirty || savingCount || perAttemptLoading}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {savingCount ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save
        </button>
      </div>
    </div>
  );
}
