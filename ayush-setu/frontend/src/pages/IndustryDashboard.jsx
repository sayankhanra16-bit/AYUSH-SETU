import { useEffect, useState } from 'react';
import { Briefcase, Inbox, Users, UserCheck, MapPin, CalendarDays, PlusCircle, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import DashboardShell from '../components/DashboardShell';
import StatCard from '../components/StatCard';
import MatchBadge from '../components/MatchBadge';
import EmptyState from '../components/EmptyState';
import { SkeletonStatRow, SkeletonCard } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';

export default function IndustryDashboard() {
  const [myOpps, setMyOpps] = useState(null);
  const [form, setForm] = useState({ title: '', companyName: '', location: '', skills: '', description: '', deadline: '', type: 'internship' });
  const [applicants, setApplicants] = useState([]);
  const [activeOpp, setActiveOpp] = useState(null);
  const [interviewDrafts, setInterviewDrafts] = useState({});
  const { showToast } = useToast();

  const loadMine = () => api.get('/opportunities/mine/list').then((res) => setMyOpps(res.data));
  useEffect(() => { loadMine(); }, []);

  const postOpportunity = async (e) => {
    e.preventDefault();
    const requiredSkills = form.skills.split(',').map((s) => ({ name: s.trim(), weight: 1 })).filter((s) => s.name);
    await api.post('/opportunities', { ...form, requiredSkills });
    setForm({ title: '', companyName: '', location: '', skills: '', description: '', deadline: '', type: 'internship' });
    loadMine();
    showToast('Opportunity posted', 'success');
  };

  const viewApplicants = async (oppId) => {
    const next = oppId === activeOpp ? null : oppId;
    setActiveOpp(next);
    if (next) {
      const { data } = await api.get(`/applications/for/${next}`);
      setApplicants(data);
    }
  };

  const updateStatus = async (appId, status) => {
    await api.patch(`/applications/${appId}/status`, { status });
    const { data } = await api.get(`/applications/for/${activeOpp}`);
    setApplicants(data);
    showToast(`Applicant ${status}`, status === 'rejected' ? 'info' : 'success');
  };
  const scheduleInterview = async (appId) => {
    const draft = interviewDrafts[appId] || {};
    if (!draft.interviewAt) return showToast('Choose an interview date and time first', 'info');
    await api.patch(`/applications/${appId}/interview`, draft);
    const { data } = await api.get(`/applications/for/${activeOpp}`);
    setApplicants(data);
    showToast('Interview scheduled and student notified', 'success');
  };

  if (myOpps === null) {
    return (
      <DashboardShell title="Industry Dashboard" subtitle="Post opportunities and review ranked applicants">
        <SkeletonStatRow count={1} />
        <SkeletonCard />
      </DashboardShell>
    );
  }

  const totalApplicants = applicants.length;
  const shortlisted = applicants.filter((app) => ['shortlisted', 'selected'].includes(app.status)).length;

  return (
    <DashboardShell title="Industry Dashboard" subtitle="Post opportunities and review ranked applicants">
      <div className="rounded-2xl bg-gradient-to-r from-navy to-brand text-white p-6 mb-7 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div><p className="text-blue-100 text-sm font-medium">TALENT PIPELINE</p><h2 className="text-2xl font-bold mt-1">Build a team with evidence, not guesswork.</h2></div>
        <div className="rounded-xl bg-white/15 px-4 py-3 text-sm"><span className="block text-white/70">Active postings</span><strong className="text-2xl">{myOpps.length}</strong></div>
      </div>
      <div className="flex gap-4 mb-7 flex-wrap">
        <StatCard icon={Briefcase} color="brand" label="Opportunities Posted" value={myOpps.length} />
        <StatCard icon={Users} color="accent" label="Applicants in View" value={totalApplicants} hint={activeOpp ? 'Selected posting' : 'Select a posting'} />
        <StatCard icon={UserCheck} color="success" label="Shortlisted" value={shortlisted} />
      </div>

      <div className="bg-card rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center gap-2 mb-1 text-navy"><PlusCircle size={19} /><h2 className="font-semibold">Post an Opportunity</h2></div>
        <p className="text-sm text-gray-500 mb-4">Use clear requirements to receive explainable candidate matches.</p>
        <form onSubmit={postOpportunity} className="grid md:grid-cols-2 gap-3">
          <input className="border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand" placeholder="Role title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand" placeholder="Company name" value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
          <input className="border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand" placeholder="Location or Remote" value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <select className="border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="internship">Internship</option><option value="job">Full-time job</option></select>
          <input type="date" className="border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <input className="border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand" placeholder="Required skills, comma-separated (e.g. react, node.js)"
            value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} required />
          <textarea className="md:col-span-2 border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand" rows="2" placeholder="A short description of the work and learning outcome" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="md:col-span-2 bg-brand text-white py-2.5 rounded-lg font-semibold hover:bg-navy transition">Publish opportunity</button>
        </form>
      </div>

      <div className="bg-card rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-navy mb-3">My Postings</h2>
        {myOpps.map((opp) => (
          <div key={opp._id} className="border border-gray-100 rounded-xl p-4 mb-3 hover:border-blue-200 transition">
            <div className="flex justify-between items-center">
              <div><span className="font-medium text-navy">{opp.title}</span><div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1"><span className="flex items-center gap-1"><MapPin size={12} />{opp.location || 'Remote'}</span>{opp.deadline && <span className="flex items-center gap-1"><CalendarDays size={12} />Closes {new Date(opp.deadline).toLocaleDateString()}</span>}</div></div>
              <button onClick={() => viewApplicants(opp._id)} className="text-brand text-sm hover:underline">
                {activeOpp === opp._id ? 'Hide Applicants' : 'View Applicants'}
              </button>
            </div>
            {activeOpp === opp._id && (
              <div className="mt-4 pt-4 border-t">
                {applicants.length === 0 && (
                  <EmptyState icon={Inbox} title="No applicants yet" description="Check back once students start applying." />
                )}
                {applicants.length > 0 && <div className="overflow-x-auto pb-2"><div className="grid grid-cols-4 gap-3 min-w-[820px]">{['applied', 'shortlisted', 'selected', 'rejected'].map((stage) => <section key={stage} className="rounded-xl bg-slate-50 p-3"><div className="flex justify-between items-center mb-3"><h3 className="text-xs font-bold text-navy uppercase tracking-wider">{stage}</h3><span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-500">{applicants.filter((a) => a.status === stage).length}</span></div><div className="space-y-2">{applicants.filter((a) => a.status === stage).map((a) => <article key={a._id} className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm"><div className="flex justify-between gap-2"><div><p className="font-medium text-navy">{a.student.name}</p><p className="text-xs text-gray-500 truncate max-w-[150px]">{a.student.email}</p></div><MatchBadge score={a.matchScore} /></div>{stage !== 'rejected' && <div className="flex gap-1 mt-3">{stage === 'applied' && <button onClick={() => updateStatus(a._id, 'shortlisted')} className="text-xs text-success font-medium">Shortlist</button>}{stage === 'shortlisted' && <button onClick={() => updateStatus(a._id, 'selected')} className="text-xs text-brand font-medium">Select</button>}<button onClick={() => updateStatus(a._id, 'rejected')} className="ml-auto text-xs text-red-500">Reject</button></div>}{['shortlisted','selected'].includes(stage) && <><input type="datetime-local" className="mt-3 border rounded w-full px-2 py-1 text-xs" value={interviewDrafts[a._id]?.interviewAt || ''} onChange={(e) => setInterviewDrafts({ ...interviewDrafts, [a._id]: { ...interviewDrafts[a._id], interviewAt: e.target.value } })} /><button onClick={() => scheduleInterview(a._id)} className="mt-2 text-xs inline-flex items-center gap-1 text-navy font-medium">Schedule interview <ChevronRight size={13} /></button></>}</article>)}</div></section>)}</div></div>}
              </div>
            )}
          </div>
        ))}
        {myOpps.length === 0 && (
          <EmptyState icon={Briefcase} title="You haven't posted anything yet" description="Use the form above to post your first opportunity." />
        )}
      </div>
    </DashboardShell>
  );
}
