import { useState, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import AssessmentAnalytics from '../../components/admin/AssessmentAnalytics';
import AssessmentDetailModal from '../../components/admin/AssessmentDetailModal';
import AssessmentQuestionManager from '../../components/admin/AssessmentQuestionManager';
import { useAssessmentResults } from '../../hooks/useAssessmentResults';
import { useConfirm } from '../../hooks/useConfirm';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';
import { logSystemEvent } from '../../lib/systemLogs';
import { Search, Eye, Trash2, Loader2, ClipboardList, HelpCircle } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'pre-assessment', label: 'Pre-Assessment' },
  { value: 'post-assessment', label: 'Post-Assessment' },
];
const MODULE_OPTIONS = ['all', 'Earthquake', 'Typhoon', 'Flood', 'General'];
const ADMIN_TABS = [
  { key: 'results', label: 'Results', icon: ClipboardList },
  { key: 'questions', label: 'Question Bank', icon: HelpCircle },
];

export default function Assessments() {
  const { rows, loading, error, removeLocal, refetch } = useAssessmentResults();
  const { confirm, confirmDialog } = useConfirm();
  const { showToast, toastElement } = useToast();
  const [adminTab, setAdminTab] = useState('results');
  const [typeFilter, setTypeFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (typeFilter !== 'all' && r.assessment_type !== typeFilter) return false;
      if (moduleFilter !== 'all' && r.disaster_module !== moduleFilter) return false;
      if (needle && !r.identifier?.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [rows, typeFilter, moduleFilter, search]);

  // Rows belonging to the same submission as `row` (same participant, same
  // assessment sitting, same insert). See the migration's note on why all
  // module rows from one submit share an identical created_at.
  function siblingsFor(row) {
    return rows.filter(
      (r) => r.identifier === row.identifier && r.assessment_type === row.assessment_type && r.created_at === row.created_at
    );
  }

  async function handleDelete(id) {
    const ok = await confirm({
      title: 'Delete this record?',
      message: 'This assessment result will be permanently removed. This cannot be undone.',
      confirmLabel: 'Delete Record',
    });
    if (!ok) return;

    setDeletingId(id);
    try {
      // --- Supabase delete ---------------------------------------------------
      const { error } = await supabase.from('assessment_results').delete().eq('id', id);
      if (error) throw error;
      // ------------------------------------------------------------------------
      removeLocal(id);
      logSystemEvent('assessment_results.deleted', {}, 'assessment_results', id);
      if (selectedRow?.id === id) setSelectedRow(null);
      showToast('Assessment record deleted.', 'success');
    } catch (err) {
      console.error('Failed to delete assessment record:', err.message);
      showToast('Failed to delete: ' + err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <AdminLayout>
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-slate-800 tracking-tighter">Assessment Results</h1>
          <p className="text-slate-400 font-bold mt-2">Pre- and Post-Assessment knowledge checks submitted from the public Assessment page.</p>
        </div>

        <div className="mb-8">
          <div className="inline-flex bg-slate-100 p-1.5 rounded-xl gap-1">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setAdminTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  adminTab === tab.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {adminTab === 'questions' ? (
          <AssessmentQuestionManager />
        ) : (
          <>
        {error && (
          <div className="mb-6 p-5 rounded-2xl border border-red-100 bg-red-50 text-red-700">
            <p className="font-black">Assessment data could not be loaded.</p>
            <p className="text-sm mt-1">{error}</p>
            <button onClick={refetch} className="mt-3 text-sm font-black underline">Try again</button>
          </div>
        )}

        <div className="mb-10">
          <AssessmentAnalytics />
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6">
          <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1 flex-wrap">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  typeFilter === opt.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-100 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 outline-none cursor-pointer"
          >
            {MODULE_OPTIONS.map((m) => (
              <option key={m} value={m}>{m === 'all' ? 'All Modules' : m}</option>
            ))}
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student ID, email, or name..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center py-20 text-slate-400 gap-4">
            <Loader2 className="animate-spin" size={40} />
            <p className="font-bold">Loading assessment results...</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
            <ClipboardList className="text-slate-200 mx-auto mb-4" size={48} />
            <p className="text-slate-400 font-bold">{rows.length === 0 ? 'No assessment submissions yet.' : 'No records match your filters.'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-6 py-4 font-black text-slate-400 uppercase text-xs tracking-wider">Participant</th>
                    <th className="px-6 py-4 font-black text-slate-400 uppercase text-xs tracking-wider">Type</th>
                    <th className="px-6 py-4 font-black text-slate-400 uppercase text-xs tracking-wider">Module</th>
                    <th className="px-6 py-4 font-black text-slate-400 uppercase text-xs tracking-wider">Score</th>
                    <th className="px-6 py-4 font-black text-slate-400 uppercase text-xs tracking-wider">Confidence</th>
                    <th className="px-6 py-4 font-black text-slate-400 uppercase text-xs tracking-wider">Submitted</th>
                    <th className="px-6 py-4 font-black text-slate-400 uppercase text-xs tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const percent = row.total_questions ? Math.round((row.score / row.total_questions) * 100) : 0;
                    return (
                      <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">{row.identifier}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase whitespace-nowrap ${
                              row.assessment_type === 'pre-assessment' ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-600'
                            }`}
                          >
                            {row.assessment_type === 'pre-assessment' ? 'Pre' : 'Post'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600 whitespace-nowrap">{row.disaster_module}</td>
                        <td className="px-6 py-4 font-black text-slate-800 whitespace-nowrap">
                          {row.score}/{row.total_questions} <span className="text-slate-400 font-bold">({percent}%)</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600 whitespace-nowrap">
                          {row.likert_preparedness_rating ? `${row.likert_preparedness_rating}/5` : '—'}
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-bold text-xs whitespace-nowrap">{formatDate(row.created_at)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedRow(row)}
                              className="p-2.5 bg-slate-100 hover:bg-orange-100 hover:text-orange-600 text-slate-400 rounded-xl transition-colors"
                              title="View details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(row.id)}
                              disabled={deletingId === row.id}
                              className="p-2.5 bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 rounded-xl transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === row.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && filteredRows.length > 0 && (
          <p className="text-center text-sm text-slate-400 mt-6">{filteredRows.length} record{filteredRows.length !== 1 ? 's' : ''}</p>
        )}
          </>
        )}
      </div>

      {selectedRow && (
        <AssessmentDetailModal row={selectedRow} siblingRows={siblingsFor(selectedRow)} onClose={() => setSelectedRow(null)} />
      )}

      {confirmDialog}
      {toastElement}
    </AdminLayout>
  );
}
