import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase } from '../../lib/supabase';
import { 
  Megaphone, Plus, Edit3, Trash2, X, 
  Send, Loader2, Clock, Tag 
} from 'lucide-react';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', body: '', category: 'System' });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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
          })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert({
            title: formData.title.trim(),
            body: formData.body.trim(),
            category: formData.category,
          });
        if (error) throw error;
      }

      setFormData({ title: '', body: '', category: 'System' });
      setShowForm(false);
      setEditingId(null);
      await fetchAnnouncements();
    } catch (err) {
      console.error('Failed to save announcement:', err.message);
      alert('Failed to save: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
      await fetchAnnouncements();
    } catch (err) {
      console.error('Failed to delete:', err.message);
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(announcement) {
    setFormData({
      title: announcement.title,
      body: announcement.body,
      category: announcement.category || 'System',
    });
    setEditingId(announcement.id);
    setShowForm(true);
  }

  function handleCancel() {
    setFormData({ title: '', body: '', category: 'System' });
    setShowForm(false);
    setEditingId(null);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
  }

  return (
    <AdminLayout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-slate-800 tracking-tighter">Announcements</h1>
            <p className="text-slate-400 font-bold mt-2">Create and manage announcements displayed on the public site.</p>
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20">
              <Plus size={18} /> New Announcement
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Megaphone className="text-orange-500" size={24} />
                <h3 className="font-black text-slate-800 text-lg">{editingId ? 'Edit Announcement' : 'New Announcement'}</h3>
              </div>
              <button onClick={handleCancel} className="text-slate-400 hover:text-slate-800 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {editingId ? 'Update' : 'Publish'}
                </button>
                <button type="button" onClick={handleCancel} className="px-8 py-3 border-2 border-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center py-20 text-slate-400 gap-4"><Loader2 className="animate-spin" size={40} /><p className="font-bold">Loading announcements...</p></div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
              <Megaphone className="text-slate-200 mx-auto mb-4" size={48} />
              <p className="text-slate-400 font-bold">No announcements yet.</p>
              <p className="text-slate-300 text-sm mt-1">Click "New Announcement" to create one.</p>
            </div>
          ) : (
            announcements.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-black text-slate-800 text-lg">{item.title}</h4>
                      <span className="px-2.5 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-lg uppercase">{item.category || 'System'}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line mb-3">{item.body}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(item.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleEdit(item)} className="p-2.5 bg-slate-100 hover:bg-blue-500 hover:text-white text-slate-500 rounded-xl transition-colors" title="Edit"><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="p-2.5 bg-slate-100 hover:bg-red-500 hover:text-white text-slate-500 rounded-xl transition-colors disabled:opacity-50" title="Delete">
                      {deletingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
