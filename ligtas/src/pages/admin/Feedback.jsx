import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase } from '../../lib/supabase';
import { MessageSquare, Mail, Trash2, CheckCircle, Circle, Loader2, Inbox, User } from 'lucide-react';

export default function Feedback() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchFeedback(); }, []);

  async function fetchFeedback() {
    if (!supabase) { setLoading(false); return; }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Failed to fetch feedback:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleRead(id, currentStatus) {
    try {
      const { error } = await supabase.from('feedback').update({ read: !currentStatus }).eq('id', id);
      if (error) throw error;
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: !currentStatus } : m));
    } catch (err) {
      console.error('Failed to update read status:', err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this feedback message?')) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('feedback').delete().eq('id', id);
      if (error) throw error;
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete feedback:', err.message);
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  const filteredMessages = messages.filter(m => {
    if (filter === 'unread') return !m.read;
    if (filter === 'read') return m.read;
    return true;
  });

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <AdminLayout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-slate-800 tracking-tighter">Feedback Inbox</h1>
            <p className="text-slate-400 font-bold mt-2">{unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1">
            {['all', 'unread', 'read'].map((tab) => (
              <button key={tab} onClick={() => setFilter(tab)} className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${filter === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                {tab}
                {tab === 'unread' && unreadCount > 0 && <span className="ml-1.5 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center py-20 text-slate-400 gap-4"><Loader2 className="animate-spin" size={40} /><p className="font-bold">Loading feedback...</p></div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
              <Inbox className="text-slate-200 mx-auto mb-4" size={48} />
              <p className="text-slate-400 font-bold">{filter === 'all' ? 'No feedback yet.' : `No ${filter} messages.`}</p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div key={msg.id} className={`bg-white rounded-2xl border p-6 shadow-sm transition-all ${msg.read ? 'border-slate-100 opacity-75' : 'border-orange-100 border-l-4 border-l-orange-500'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${msg.read ? 'bg-slate-100 text-slate-400' : 'bg-orange-100 text-orange-600'}`}><User size={14} /></div>
                      <div>
                        <h4 className="font-black text-slate-800 text-sm">{msg.name}</h4>
                        {msg.email && <p className="text-xs text-slate-400 flex items-center gap-1"><Mail size={10} /> {msg.email}</p>}
                      </div>
                      {!msg.read && <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[9px] font-black rounded-md uppercase">New</span>}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line mt-3 pl-11">{msg.message}</p>
                    <p className="text-xs text-slate-300 mt-3 pl-11">{formatDate(msg.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleRead(msg.id, msg.read)} className={`p-2.5 rounded-xl transition-colors ${msg.read ? 'bg-slate-100 text-slate-400 hover:bg-orange-100 hover:text-orange-600' : 'bg-green-100 text-green-600 hover:bg-green-200'}`} title={msg.read ? 'Mark as unread' : 'Mark as read'}>
                      {msg.read ? <Circle size={16} /> : <CheckCircle size={16} />}
                    </button>
                    <button onClick={() => handleDelete(msg.id)} disabled={deletingId === msg.id} className="p-2.5 bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 rounded-xl transition-colors disabled:opacity-50" title="Delete">
                      {deletingId === msg.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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
