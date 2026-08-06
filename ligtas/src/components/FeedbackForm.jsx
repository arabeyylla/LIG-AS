import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send, CheckCircle, Loader2 } from 'lucide-react';

export default function FeedbackForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) return;
    if (!supabase) { setError('Backend not configured.'); return; }

    setSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('feedback').insert({
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        message: formData.message.trim(),
        read: false,
      });
      if (insertError) throw insertError;

      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Failed to submit feedback:', err.message);
      setError('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
        <CheckCircle className="text-green-500 mx-auto mb-4" size={40} />
        <h4 className="font-black text-slate-800 text-lg mb-2">Message Sent!</h4>
        <p className="text-gray-500 text-sm mb-4">Thank you for your feedback. Our team will review it shortly.</p>
        <button onClick={() => setSubmitted(false)} className="text-orange-500 font-bold text-sm hover:text-orange-600 transition-colors">Send another message</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
      <h4 className="font-black text-slate-800 text-lg mb-2">Send Us Feedback</h4>
      <p className="text-gray-500 text-sm mb-6">Have questions, suggestions, or found a bug? Let us know.</p>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-orange-500 transition-all" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email (optional)</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="your@email.com" className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-orange-500 transition-all" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Message *</label>
          <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Write your message here..." rows={4} className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-orange-500 transition-all resize-none" required />
        </div>
        <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
