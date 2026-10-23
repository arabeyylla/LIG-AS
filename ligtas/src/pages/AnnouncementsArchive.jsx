import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Megaphone, Search, Pin, Loader2, ChevronDown } from "lucide-react";
import { supabase } from '../lib/supabase';
import { trackPageVisit } from '../lib/analytics';

const PAGE_SIZE = 10;

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
const monthKey = (value) =>
  new Date(value).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

/**
 * Public "/announcements" archive: every visible announcement, newest first,
 * in full (the Landing page only shows the latest few, clamped to 4 lines).
 * Pinned ones are listed on top; the rest are grouped by month, with search,
 * a category filter, and "Show older announcements" paging. Hidden
 * announcements (`is_active = false`) never appear. A `#announcement-<id>`
 * hash (used by the Landing cards) scrolls to that announcement.
 */
export default function AnnouncementsArchive() {
  const { hash } = useLocation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(supabase));
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => { trackPageVisit('announcements'); }, []);

  useEffect(() => {
    if (!supabase) return;

    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, body, category, created_at, is_pinned, is_active')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Failed to load announcements:', error.message);
        setLoadError(true);
      } else {
        // `?? true`: rows from before the visibility column existed count as visible.
        setAnnouncements((data || []).filter((a) => a.is_active ?? true));
        setLoadError(false);
      }
      setLoading(false);
    };

    fetchAnnouncements();
    const channel = supabase
      .channel('public-announcements-archive')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, fetchAnnouncements)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Scroll to a linked announcement once it has loaded.
  useEffect(() => {
    if (loading || !hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [loading, hash]);

  const categories = useMemo(
    () => [...new Set(announcements.map((a) => a.category || 'System'))].sort(),
    [announcements]
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return announcements.filter((a) => {
      if (category !== 'all' && (a.category || 'System') !== category) return false;
      if (needle && !`${a.title} ${a.body}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [announcements, search, category]);

  // Changing a filter starts paging over from the first page.
  function changeSearch(value) { setSearch(value); setVisibleCount(PAGE_SIZE); }
  function changeCategory(value) { setCategory(value); setVisibleCount(PAGE_SIZE); }

  const pinned = filtered.filter((a) => a.is_pinned);
  const others = filtered.filter((a) => !a.is_pinned);
  // A linked (#announcement-<id>) announcement must be on the page to scroll to it.
  const linkedIndex = hash ? others.findIndex((a) => `#announcement-${a.id}` === hash) : -1;
  const shownCount = Math.max(visibleCount, linkedIndex + 1);
  const shownOthers = others.slice(0, shownCount);
  const months = shownOthers.reduce((groups, item) => {
    const key = monthKey(item.created_at);
    const group = groups.find((g) => g.key === key);
    if (group) group.items.push(item);
    else groups.push({ key, items: [item] });
    return groups;
  }, []);
  const hasFilters = search.trim() !== '' || category !== 'all';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO */}
      <section className="relative bg-[#0a1120] text-white py-16 sm:py-24 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a1120]"></div>
        <div className="absolute inset-0 bg-orange-500/5" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)' }}></div>

        <div className="relative z-10 px-4 sm:px-8 lg:px-[10%] text-center">
          <div className="inline-block px-4 py-1.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            Archive
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-tight">
            Announcements <span className="text-orange-500">&amp; Updates</span>
          </h1>
          <p className="mt-6 text-base sm:text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Every update from the LIG+AS team, including past announcements.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="px-4 sm:px-8 lg:px-[15%]">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="search"
                value={search}
                onChange={(e) => changeSearch(e.target.value)}
                placeholder="Search announcements..."
                aria-label="Search announcements"
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-orange-400 transition-all"
              />
            </div>
            <select
              value={category}
              onChange={(e) => changeCategory(e.target.value)}
              aria-label="Filter by category"
              className="sm:w-56 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer focus:border-orange-400"
            >
              <option value="all">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-16 text-gray-400 gap-3">
              <Loader2 className="animate-spin" size={32} />
              <p className="font-bold text-sm">Loading announcements...</p>
            </div>
          ) : loadError ? (
            <EmptyState text="Announcements couldn't be loaded right now. Please try again later." />
          ) : filtered.length === 0 ? (
            <EmptyState
              text={hasFilters ? 'No announcements match your search.' : 'No announcements yet. Check back later for news and updates from the LIG+AS team.'}
              action={hasFilters && (
                <button onClick={() => { changeSearch(''); changeCategory('all'); }} className="mt-4 text-sm font-black text-orange-500 hover:text-orange-600">
                  Clear filters
                </button>
              )}
            />
          ) : (
            <div className="space-y-12">
              {pinned.length > 0 && (
                <AnnouncementGroup title="Pinned" icon={<Pin size={16} className="text-purple-600" />} items={pinned} hash={hash} />
              )}
              {months.map((group) => (
                <AnnouncementGroup key={group.key} title={group.key} items={group.items} hash={hash} />
              ))}

              {others.length > shownCount && (
                <div className="text-center">
                  <button
                    onClick={() => setVisibleCount(shownCount + PAGE_SIZE)}
                    className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-orange-300 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                  >
                    Show older announcements <ChevronDown size={16} />
                  </button>
                  <p className="text-xs text-gray-400 mt-2">
                    Showing {shownOthers.length} of {others.length}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-14 text-center">
            <Link to="/" className="text-sm font-black text-slate-500 hover:text-orange-500 transition-colors">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function AnnouncementGroup({ title, icon, items, hash }) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
        {icon} {title}
      </h2>
      <div className="space-y-4">
        {items.map((item) => (
          <AnnouncementCard key={item.id} item={item} highlighted={hash === `#announcement-${item.id}`} />
        ))}
      </div>
    </div>
  );
}

function AnnouncementCard({ item, highlighted }) {
  return (
    <article
      id={`announcement-${item.id}`}
      className={`scroll-mt-24 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border transition-all ${
        highlighted ? 'border-orange-400 ring-2 ring-orange-500/20' : 'border-gray-100'
      } ${item.is_pinned ? 'border-l-4 border-l-purple-500' : ''}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-400 mb-3">
        <span className="px-2.5 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-lg uppercase">{item.category || 'System'}</span>
        <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
        {item.is_pinned && (
          <span className="flex items-center gap-1 px-2.5 py-0.5 bg-purple-100 text-purple-600 text-[10px] font-bold rounded-lg uppercase">
            <Pin size={10} /> Pinned
          </span>
        )}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
      <p className="text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-line break-words">{item.body}</p>
    </article>
  );
}

function EmptyState({ text, action }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-100">
      <Megaphone className="text-gray-200 mx-auto mb-4" size={44} />
      <p className="text-gray-500 font-medium">{text}</p>
      {action}
    </div>
  );
}
