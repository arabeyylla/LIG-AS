import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminFilterBar from '../../components/admin/AdminFilterBar';
import { supabase } from '../../lib/supabase';
import { logSystemEvent } from '../../lib/systemLogs';
import { useConfirm } from '../../hooks/useConfirm';
import { useToast } from '../../hooks/useToast';
import { useSiteSetting } from '../../hooks/useSiteSetting';
import {
  Megaphone, Plus, Edit3, Trash2, X,
  Send, Loader2, Clock, Eye, EyeOff, Monitor, Pin
} from 'lucide-react';

const VISIBILITY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Shown / Active' },
  { value: 'hidden', label: 'Hidden' },
];
const DISPLAY_COUNT_OPTIONS = [3, 5, 10];
const EMPTY_FORM = { title: '', body: '', category: 'System', pinned: false };

export default function Announcements() {
  const { confirm, confirmDialog } = useConfirm();
  const { showToast, toastElement } = useToast();
  const { value: displayCount, save: saveDisplayCount, loading: displayCountLoading } = useSiteSetting('announcements_display_count', 5);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Unified filter bar state (date range + visibility + limit)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [limit, setLimit] = useState(50);

  const categories = ['System', 'Update', 'Advisory', 'Patch Notes', 'Event'];

  useEffect(() => { fetchAnnouncements(); }, []);

  async function fetchAnnouncements() {
    if (!supabase) { setLoading(false); return; }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Failed to fetch announcements:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim() || !supabase) return;

    setSubmitting(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('announcements')
          .update({
            title: formData.title.trim(),
            body: formData.body.trim(),
            category: formData.category,
            is_pinned: formData.pinned,
          })
          .eq('id', editingId);
        if (error) throw error;
        logSystemEvent('announcement.updated', { title: formData.title.trim() }, 'announcement', editingId);
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert({
            title: formData.title.trim(),
            body: formData.body.trim(),
            category: formData.category,
            is_pinned: formData.pinned,
          });
        if (error) throw error;
        logSystemEvent('announcement.created', { title: formData.title.trim() }, 'announcement');
      }

      const wasEditing = Boolean(editingId);
      setFormData(EMPTY_FORM);
      setShowForm(false);
      setEditingId(null);
      await fetchAnnouncements();
      showToast(wasEditing ? 'Announcement updated.' : 'Announcement published.', 'success');
    } catch (err) {
      console.error('Failed to save announcement:', err.message);
      showToast('Failed to save: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const ok = await confirm({
      title: 'Delete this announcement?',
      message: 'It will be removed from the public site immediately. This cannot be undone.',
      confirmLabel: 'Delete Announcement',
    });
    if (!ok) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
      logSystemEvent('announcement.deleted', {}, 'announcement', id);
      await fetchAnnouncements();
      showToast('Announcement deleted.', 'success');
    } catch (err) {
      console.error('Failed to delete:', err.message);
      showToast('Failed to delete: ' + err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  }

  // Opens the edit form INLINE, in place of this specific card in the list
  // (see the `editingId === item.id` branch below) — no need to scroll up
  // to a top-of-page form. Closes the "New Announcement" panel if it was
  // open, so only one form is ever active at a time.
  function handleEdit(announcement) {
    setFormData({
      title: announcement.title,
      body: announcement.body,
      category: announcement.category || 'System',
      pinned: announcement.is_pinned ?? false,
    });
    setEditingId(announcement.id);
    setShowForm(false);
  }

  function handleCancel() {
    setFormData(EMPTY_FORM);
    setShowForm(false);
  }

  function handleCancelEdit() {
    setFormData(EMPTY_FORM);
    setEditingId(null);
  }

  function handleStartNew() {
    setEditingId(null); // close any inline edit in progress first
    setShowForm(true);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
  }

  async function toggleActive(item) {
    const nextActive = !(item.is_active ?? true);
    setTogglingId(item.id);
    try {
      const { error } = await supabase.from('announcements').update({ is_active: nextActive }).eq('id', item.id);
      if (error) throw error;
      setAnnouncements((prev) => prev.map((a) => (a.id === item.id ? { ...a, is_active: nextActive } : a)));
      logSystemEvent(nextActive ? 'announcement.shown' : 'announcement.hidden', {}, 'announcement', item.id);
      showToast(nextActive ? 'Announcement is now visible on the public site.' : 'Announcement hidden from the public site.', 'success');
    } catch (err) {
      console.error('Failed to update visibility:', err.message);
      showToast('Failed to update visibility: ' + err.message, 'error');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDisplayCountChange(nextCount) {
    const { error } = await saveDisplayCount(nextCount);
    if (error) {
      console.error('Failed to save display count:', error.message);
      showToast('Failed to save display setting: ' + error.message, 'error');
    } else {
      logSystemEvent('site_settings.updated', { key: 'announcements_display_count', value: nextCount }, 'site_settings');
      showToast(`Landing page will now show the ${nextCount} most recent announcements, plus any pinned ones.`, 'success');
    }
  }

  // `is_active` defaults to true for rows created before this column
  // existed (`?? true`), so nothing that was visible before appears hidden.
  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((a) => {
        const active = a.is_active ?? true;
        if (visibility === 'active' && !active) return false;
        if (visibility === 'hidden' && active) return false;
        if (startDate && new Date(a.created_at) < new Date(startDate)) return false;
        if (endDate && new Date(a.created_at) > new Date(`${endDate}T23:59:59`)) return false;
        return true;
      })
      .slice(0, limit);
  }, [announcements, visibility, startDate, endDate, limit]);

  return (
    <AdminLayout>
      <div className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-slate-800 tracking-tighter">Announcements</h1>
            <p className="text-slate-400 font-bold mt-2">Create and manage announcements displayed on the public site.</p>
          </div>
          {!showForm && (
            <button onClick={handleStartNew} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20">
              <Plus size={18} /> New Announcement
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-8 p-4 bg-white rounded-2xl border border-slate-100">
          <Monitor className="text-slate-400 flex-shrink-0" size={18} />
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-700">Display Count on Landing Page</p>
            <p className="text-xs text-slate-400">How many of the most recent announcements appear publicly (pinned ones always show in addition).</p>
          </div>
          <select
            value={displayCount}
            disabled={displayCountLoading}
            onChange={(e) => handleDisplayCountChange(Number(e.target.value))}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-700 outline-none cursor-pointer disabled:opacity-50"
          >
            {DISPLAY_COUNT_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <AdminFilterBar
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          visibility={visibility}
          onVisibilityChange={setVisibility}
          visibilityOptions={VISIBILITY_OPTIONS}
          limit={limit}
          onLimitChange={setLimit}
        />

        {showForm && (
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Megaphone className="text-orange-500" size={24} />
                <h3 className="font-black text-slate-800 text-lg">New Announcement</h3>
              </div>
              <button onClick={handleCancel} className="text-slate-400 hover:text-slate-800 transition-colors"><X size={20} /></button>
            </div>
            <AnnouncementFormFields
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              onSubmit={handleSubmit}
              submitting={submitting}
              onCancel={handleCancel}
              submitLabel="Publish"
            />
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center py-20 text-slate-400 gap-4"><Loader2 className="animate-spin" size={40} /><p className="font-bold">Loading announcements...</p></div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
              <Megaphone className="text-slate-200 mx-auto mb-4" size={48} />
              <p className="text-slate-400 font-bold">{announcements.length === 0 ? 'No announcements yet.' : 'No announcements match your filters.'}</p>
              {announcements.length === 0 && <p className="text-slate-300 text-sm mt-1">Click "New Announcement" to create one.</p>}
            </div>
          ) : (
            filteredAnnouncements.map((item) => {
              // Inline edit: this card becomes the edit form in place, so
              // there's no need to scroll up to a top-of-page form.
              if (editingId === item.id) {
                return (
                  <div key={item.id} className="bg-white rounded-2xl border-2 border-orange-300 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <Edit3 className="text-orange-500" size={20} />
                      <h3 className="font-black text-slate-800">Editing Announcement</h3>
                    </div>
                    <AnnouncementFormFields
                      formData={formData}
                      setFormData={setFormData}
                      categories={categories}
                      onSubmit={handleSubmit}
                      submitting={submitting}
                      onCancel={handleCancelEdit}
                      submitLabel="Update"
                    />
                  </div>
                );
              }

              const active = item.is_active ?? true;
              const pinned = item.is_pinned ?? false;
              return (
                <div key={item.id} className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all ${active ? 'border-slate-100' : 'border-slate-100 opacity-60'} ${pinned ? 'border-l-4 border-l-purple-500' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h4 className="font-black text-slate-800 text-lg">{item.title}</h4>
                        <span className="px-2.5 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-lg uppercase">{item.category || 'System'}</span>
                        {pinned && <span className="flex items-center gap-1 px-2.5 py-0.5 bg-purple-100 text-purple-600 text-[10px] font-bold rounded-lg uppercase"><Pin size={10} /> Pinned</span>}
                        {!active && <span className="px-2.5 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg uppercase">Hidden</span>}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line mb-3">{item.body}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(item.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleActive(item)}
                        disabled={togglingId === item.id}
                        className={`p-2.5 rounded-xl transition-colors disabled:opacity-50 ${active ? 'bg-slate-100 hover:bg-slate-200 text-slate-500' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                        title={active ? 'Hide from public site' : 'Show on public site'}
                      >
                        {togglingId === item.id ? <Loader2 size={16} className="animate-spin" /> : active ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button onClick={() => handleEdit(item)} className="p-2.5 bg-slate-100 hover:bg-blue-500 hover:text-white text-slate-500 rounded-xl transition-colors" title="Edit"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="p-2.5 bg-slate-100 hover:bg-red-500 hover:text-white text-slate-500 rounded-xl transition-colors disabled:opacity-50" title="Delete">
                        {deletingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {confirmDialog}
      {toastElement}
    </AdminLayout>
  );
}

// Shared form fields for both the top "New Announcement" panel and the
// inline "Edit" form rendered in place of a list item — kept in one place
// so the two stay visually and behaviorally identical.
function AnnouncementFormFields({ formData, setFormData, categories, onSubmit, submitting, onCancel, submitLabel }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Announcement title..." className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-xl font-bold text-slate-800 outline-none transition-all" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
          <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-xl font-bold text-slate-800 outline-none transition-all appearance-none">
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Content</label>
        <textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} placeholder="Write your announcement content..." rows={5} className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-xl font-bold text-slate-800 outline-none transition-all resize-none" required />
      </div>
      <label className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl cursor-pointer">
        <input
          type="checkbox"
          checked={formData.pinned}
          onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
          className="mt-0.5 w-4 h-4 accent-purple-600 flex-shrink-0"
        />
        <span className="flex-1">
          <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <Pin size={14} className="text-purple-600" /> Pin this announcement
          </span>
          <span className="block text-xs font-medium text-slate-500 mt-1">
            Stays fixed on the public announcement bar while the other latest announcements continue to rotate in.
          </span>
        </span>
      </label>
      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="px-8 py-3 border-2 border-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Cancel</button>
      </div>
    </form>
  );
}
