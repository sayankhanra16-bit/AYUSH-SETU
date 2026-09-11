import { useEffect, useMemo, useState } from 'react';
import { Briefcase, MapPin, CalendarDays, Sparkles, Bookmark, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import api from '../api/axios';
import DashboardShell from '../components/DashboardShell';
import MatchBadge from '../components/MatchBadge';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';

export default function Opportunities() {
  const [list, setList] = useState(null);
  const [applied, setApplied] = useState({});
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState({});
  const [workMode, setWorkMode] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [selected, setSelected] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    api.get('/opportunities').then((res) => setList(res.data));
    api.get('/applications/mine').then((res) => {
      const map = {};
      res.data.forEach((a) => { map[a.opportunity._id] = a.matchScore; });
      setApplied(map);
    });
    api.get('/saved/mine').then((res) => setSaved(Object.fromEntries(res.data.map((item) => [item.opportunity._id, true]))));
  }, []);

  const apply = async (id) => {
    try {
      const { data } = await api.post(`/applications/${id}`);
      setApplied((prev) => ({ ...prev, [id]: data.matchScore }));
      showToast(`Applied — ${data.matchScore}% match`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not apply', 'error');
    }
  };

  const toggleSaved = async (id) => {
    try {
      if (saved[id]) { await api.delete(`/saved/${id}`); setSaved((items) => ({ ...items, [id]: false })); showToast('Removed from saved opportunities', 'info'); }
      else { await api.post(`/saved/${id}`); setSaved((items) => ({ ...items, [id]: true })); showToast('Opportunity saved — keep an eye on its deadline', 'success'); }
    } catch (err) { showToast(err.response?.data?.message || 'Could not update saved opportunities', 'error'); }
  };

  const filtered = useMemo(() => (list || []).filter((o) =>
    !search.trim() ||
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.companyName.toLowerCase().includes(search.toLowerCase()) ||
    o.requiredSkills.some((s) => s.name.toLowerCase().includes(search.toLowerCase()))
  ).filter((o) => workMode === 'all' || (workMode === 'remote' ? (o.location || '').toLowerCase().includes('remote') : o.type === workMode)).sort((a, b) => {
    if (sortBy === 'deadline') return new Date(a.deadline || '2999-01-01') - new Date(b.deadline || '2999-01-01');
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    return (applied[b._id] || 0) - (applied[a._id] || 0);
  }), [list, search, workMode, sortBy, applied]);

  return (
    <DashboardShell
      title="Internships & Jobs"
      subtitle="Apply and get an instant, explainable match score"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by title, company, or skill..."
    >
      <div className="soft-enter bg-gradient-to-r from-navy to-brand rounded-2xl text-white p-6 mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div><p className="text-blue-100 text-xs font-semibold tracking-widest">OPPORTUNITY MATCHING</p><h2 className="text-xl font-bold mt-1">Find roles where your skills matter.</h2><p className="text-sm text-white/75 mt-1">Every match explains what you have and what to strengthen.</p></div><div className="rounded-xl bg-white/10 px-4 py-3"><span className="text-2xl font-bold">{filtered.length}</span><span className="text-sm text-white/75 ml-2">roles to explore</span></div>
      </div>
      <div className="flex flex-wrap gap-2 items-center mb-5 no-print"><span className="text-xs font-semibold text-gray-500 inline-flex items-center gap-1"><SlidersHorizontal size={14} /> FILTER</span>{[['all','All roles'],['remote','Remote'],['internship','Internships'],['job','Jobs']].map(([value,label]) => <button key={value} onClick={() => setWorkMode(value)} className={`rounded-full px-3 py-1.5 text-sm border transition ${workMode === value ? 'bg-navy text-white border-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-brand'}`}>{label}</button>)}<div className="ml-auto flex items-center gap-2 text-sm"><ArrowUpDown size={15} className="text-gray-400" /><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-gray-200 rounded-lg p-1.5"><option value="recommended">Best match</option><option value="deadline">Deadline</option><option value="newest">Newest</option></select></div></div>
      {list === null && (<><SkeletonCard /><SkeletonCard /></>)}

      {list !== null && filtered.map((opp) => (
        <article key={opp._id} className="lift-card bg-card border border-gray-100 rounded-xl p-5 mb-3 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-semibold text-lg">{opp.title}</h2>
              <p className="text-sm text-gray-600 flex flex-wrap items-center gap-x-3 gap-y-1"><span>{opp.companyName}</span><span className="flex items-center gap-1"><MapPin size={13} />{opp.location || 'Remote'}</span>{opp.deadline && <span className="flex items-center gap-1"><CalendarDays size={13} />Apply by {new Date(opp.deadline).toLocaleDateString()}</span>}</p>
              <span className="inline-flex items-center gap-1 mt-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-brand"><Sparkles size={12} />{opp.type === 'job' ? 'Full-time role' : 'Internship'}</span>
              <p className="text-sm mt-1">
                Required: {opp.requiredSkills.map((s) => s.name).join(', ')}
              </p>
              <button onClick={() => setSelected(opp)} className="text-sm text-brand font-medium mt-3 hover:underline">View role details →</button>
            </div>
            <div className="flex gap-2 items-center">
              <button onClick={() => toggleSaved(opp._id)} title="Save opportunity" className={`p-2 rounded-lg border ${saved[opp._id] ? 'bg-blue-50 text-brand border-blue-200' : 'text-gray-400 border-gray-200 hover:text-brand'}`}><Bookmark size={17} fill={saved[opp._id] ? 'currentColor' : 'none'} /></button>
              {applied[opp._id] !== undefined ? <MatchBadge score={applied[opp._id]} /> : <button onClick={() => apply(opp._id)} className="bg-brand text-white px-4 py-2 rounded-lg h-fit hover:bg-navy transition">Apply</button>}
            </div>
          </div>
        </article>
      ))}

      {list !== null && filtered.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title={search ? 'No matching opportunities' : 'No opportunities posted yet'}
          description={search ? 'Try a different search term.' : 'Check back soon, or ask an industry partner to post one.'}
        />
      )}
      {selected && <div className="fixed inset-0 z-40 bg-navy/40 p-4 flex items-end sm:items-center justify-center" onClick={() => setSelected(null)}><section role="dialog" aria-modal="true" aria-label="Opportunity details" className="soft-enter bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6" onClick={(e) => e.stopPropagation()}><div className="flex justify-between gap-4"><div><span className="text-xs font-bold tracking-wider text-brand">{selected.type === 'job' ? 'FULL-TIME ROLE' : 'INTERNSHIP'}</span><h2 className="text-xl font-bold text-navy mt-1">{selected.title}</h2><p className="text-gray-500">{selected.companyName} · {selected.location || 'Remote'}</p></div><button aria-label="Close details" onClick={() => setSelected(null)} className="text-gray-400 hover:text-navy"><X /></button></div><p className="text-sm text-gray-700 mt-5 leading-6">{selected.description || 'The employer has not added a detailed description yet.'}</p><div className="mt-5"><p className="text-xs font-semibold text-gray-500 mb-2">REQUIRED SKILLS</p><div className="flex flex-wrap gap-2">{selected.requiredSkills.map((skill) => <span key={skill.name} className="bg-blue-50 text-brand rounded-full px-3 py-1 text-sm">{skill.name}</span>)}</div></div><div className="mt-6 flex justify-end gap-2"><button onClick={() => toggleSaved(selected._id)} className="border rounded-lg px-4 py-2 text-sm">{saved[selected._id] ? 'Saved' : 'Save for later'}</button>{applied[selected._id] === undefined && <button onClick={() => { apply(selected._id); setSelected(null); }} className="bg-brand text-white rounded-lg px-4 py-2 text-sm font-semibold">Apply now</button>}</div></section></div>}
    </DashboardShell>
  );
}
