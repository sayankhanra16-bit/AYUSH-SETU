import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Send, Target, Flag, X, UploadCloud, ArrowRight, CheckCircle2, Sparkles, GraduationCap, Route, BadgeCheck } from 'lucide-react';
import api from '../api/axios';
import DashboardShell from '../components/DashboardShell';
import StatCard from '../components/StatCard';
import SkillGapChart from '../components/SkillGapChart';
import { SkeletonStatRow, SkeletonCard } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [skillName, setSkillName] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadProfile = () => api.get('/profile/me').then((res) => setProfile(res.data));

  useEffect(() => {
    loadProfile();
    api.get('/applications/mine').then((res) => setApplications(res.data));
  }, []);

  const addSkill = async () => {
    if (!skillName.trim()) return;
    const updatedSkills = [...profile.skills, { name: skillName.trim(), level: 3, source: 'self' }];
    const { data } = await api.put('/profile/me', { skills: updatedSkills });
    setProfile(data);
    setSkillName('');
    showToast(`Added "${skillName.trim()}" to your skills`, 'success');
  };

  const removeSkill = async (index) => {
    const removed = profile.skills[index];
    const updatedSkills = profile.skills.filter((_, i) => i !== index);
    const { data } = await api.put('/profile/me', { skills: updatedSkills });
    setProfile(data);
    showToast(`Removed "${removed.name}"`, 'info');
  };

  const verifySkill = async (name) => {
    const answer = window.prompt(`Demo assessment: enter your ${name} assessment score (0–100). Scores of 60+ earn a verified badge.`);
    if (answer === null) return;
    try {
      const { data } = await api.post('/profile/verify-skill', { name, score: Number(answer) });
      setProfile(data);
      showToast(`${name} is now skill-verified`, 'success');
    } catch (err) { showToast(err.response?.data?.message || 'Could not verify this skill', 'error'); }
  };

  const saveProfileDetails = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/profile/me', {
        targetRole: profile.targetRole,
        education: profile.education,
        department: profile.department,
      });
      setProfile(data);
      showToast('Career goal saved', 'success');
    } catch {
      showToast('Could not save your profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadResume = async () => {
    if (!resumeFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const { data } = await api.post('/profile/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const existingNames = profile.skills.map((s) => s.name.toLowerCase());
      const newOnes = data.suggestedSkills.filter((s) => !existingNames.includes(s.name.toLowerCase()));
      const merged = [...profile.skills, ...newOnes];
      const { data: updated } = await api.put('/profile/me', { skills: merged });
      setProfile(updated);
      showToast(
        newOnes.length ? `Found ${newOnes.length} new skill(s) in your resume` : 'No new skills found in resume',
        newOnes.length ? 'success' : 'info'
      );
    } catch (err) {
      showToast('Could not process resume — try a different PDF', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (!profile) {
    return (
      <DashboardShell title="My Dashboard" subtitle="Your skills, gaps, and applications at a glance">
        <SkeletonStatRow count={4} />
        <SkeletonCard />
      </DashboardShell>
    );
  }

  const applied = applications.length;
  const avgMatch = applied
    ? Math.round(applications.reduce((sum, a) => sum + a.matchScore, 0) / applied)
    : 0;
  const skillGapData = applications[0]
    ? [...new Set([...(applications[0].matchedSkills || []), ...(applications[0].missingSkills || [])])].map((skill) => ({
        skill,
        have: applications[0].matchedSkills.includes(skill) ? 1 : 0,
        need: 1,
      }))
    : [];
  const completionItems = [
    profile.targetRole,
    profile.education,
    profile.skills.length >= 3,
    applied > 0,
  ];
  const readiness = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);
  const applicationSummary = ['applied', 'shortlisted', 'selected'].map((status) => ({
    status,
    count: applications.filter((item) => item.status === status).length,
  }));
  const roadmapSkills = [...new Set(applications.flatMap((item) => item.missingSkills || []))].slice(0, 3);

  return (
    <DashboardShell title="My Dashboard" subtitle="Your skills, gaps, and applications at a glance">
      <div className="rounded-2xl bg-gradient-to-r from-navy via-brand to-blue-500 text-white p-6 mb-7 overflow-hidden relative">
        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">YOUR CAREER COMMAND CENTER</p>
            <h2 className="text-2xl font-bold">Make your next application count.</h2>
            <p className="text-white/80 mt-2 max-w-xl">Build a stronger profile, understand your skill gaps, and apply where you have the best fit.</p>
          </div>
          <button onClick={() => navigate('/opportunities')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 font-semibold text-navy hover:bg-blue-50 transition">
            Explore opportunities <ArrowRight size={17} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-7 flex-wrap">
        <StatCard icon={BookOpen} color="brand" label="Skills Added" value={profile.skills.length} />
        <StatCard icon={Send} color="accent" label="Applications" value={applied} />
        <StatCard icon={Target} color="success" label="Avg. Match Score" value={`${avgMatch}%`} />
        <StatCard icon={Flag} color="navy" label="Target Role" value={profile.targetRole || 'Not set'} />
      </div>

      <div className="grid xl:grid-cols-3 gap-6 mb-6">
        <section className="bg-card rounded-xl shadow-sm p-6 border border-blue-50 xl:col-span-2">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-brand">Career readiness</p>
              <h2 className="font-semibold text-navy text-lg mt-1">Complete your profile to get better matches</h2>
            </div>
            <div className="h-16 w-16 rounded-full grid place-items-center" style={{ background: `conic-gradient(#0070C0 ${readiness * 3.6}deg, #E8F1FA 0deg)` }}>
              <div className="h-12 w-12 rounded-full bg-white grid place-items-center text-sm font-bold text-navy">{readiness}%</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              ['Choose a target role', Boolean(profile.targetRole)],
              ['Add your education', Boolean(profile.education)],
              ['Add at least 3 skills', profile.skills.length >= 3],
              ['Submit your first application', applied > 0],
            ].map(([label, done]) => (
              <div key={label} className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${done ? 'bg-green-50 text-success' : 'bg-gray-50 text-gray-600'}`}>
                <CheckCircle2 size={17} className={done ? '' : 'text-gray-300'} /> {label}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-card rounded-xl shadow-sm p-6 border border-orange-100">
          <div className="flex items-center gap-2 text-accent mb-3"><Sparkles size={18} /><span className="text-xs uppercase tracking-wider font-semibold">Application pipeline</span></div>
          <div className="space-y-3">
            {applicationSummary.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="capitalize text-sm text-gray-600">{item.status}</span>
                <span className="rounded-full bg-orange-50 text-accent px-2.5 py-0.5 text-sm font-bold">{item.count}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-5">A transparent status trail for every application.</p>
        </section>
      </div>

      <div className="grid xl:grid-cols-5 gap-6 mb-6">
      <div className="bg-card rounded-xl shadow-sm p-6 xl:col-span-3">
        <h2 className="font-semibold text-navy mb-1">My Skill Profile</h2>
        <p className="text-sm text-gray-500 mb-4">Add skills manually or extract them from a PDF resume.</p>
        <div className="flex gap-2 mb-4">
          <input className="border p-2 rounded flex-1" placeholder="Add a skill e.g. React"
            value={skillName} onChange={(e) => setSkillName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSkill()} />
          <button onClick={addSkill} className="bg-brand text-white px-4 rounded hover:bg-navy transition">Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {profile.skills.map((s, i) => (
            <span key={i} className="group inline-flex items-center gap-1.5 bg-blue-100 text-brand pl-3 pr-1.5 py-1 rounded-full text-sm">
              {s.name}
              {s.source === 'verified' ? <BadgeCheck size={14} className="text-success" /> : <button onClick={() => verifySkill(s.name)} title="Complete skill assessment" className="text-xs text-brand hover:underline">Verify</button>}
              <button onClick={() => removeSkill(i)} className="opacity-50 group-hover:opacity-100 hover:bg-blue-200 rounded-full p-0.5 transition">
                <X size={12} />
              </button>
            </span>
          ))}
          {profile.skills.length === 0 && <p className="text-gray-400 text-sm">No skills added yet.</p>}
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2 text-sm text-gray-600 flex items-center gap-1.5">
            <UploadCloud size={16} /> Auto-extract skills from resume (PDF)
          </h3>
          <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files[0])} />
          <button onClick={uploadResume} disabled={uploading}
            className="ml-3 bg-accent text-white px-4 py-1 rounded disabled:opacity-50 hover:brightness-95 transition">
            {uploading ? 'Extracting...' : 'Extract Skills'}
          </button>
        </div>
      </div>

      <form onSubmit={saveProfileDetails} className="bg-card rounded-xl shadow-sm p-6 xl:col-span-2">
        <div className="flex items-center gap-2 mb-1 text-navy"><GraduationCap size={19} /><h2 className="font-semibold">Career preferences</h2></div>
        <p className="text-sm text-gray-500 mb-4">Tell employers where you want to grow.</p>
        <label className="block text-sm font-medium text-gray-700 mb-1">Target role</label>
        <input className="border border-gray-200 rounded-lg p-2.5 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-brand" placeholder="e.g. Data Analyst" value={profile.targetRole || ''} onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })} />
        <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
        <input className="border border-gray-200 rounded-lg p-2.5 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-brand" placeholder="e.g. B.Tech, 3rd year" value={profile.education || ''} onChange={(e) => setProfile({ ...profile, education: e.target.value })} />
        <label className="block text-sm font-medium text-gray-700 mb-1">Department / cohort</label>
        <input className="border border-gray-200 rounded-lg p-2.5 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-brand" placeholder="e.g. Computer Science" value={profile.department || ''} onChange={(e) => setProfile({ ...profile, department: e.target.value })} />
        <button disabled={savingProfile} className="w-full bg-navy text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand transition disabled:opacity-60">{savingProfile ? 'Saving...' : 'Save career goal'}</button>
      </form>
      </div>

      <section className="bg-card rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
        <div className="flex items-center gap-2 text-navy"><Route size={19} className="text-brand" /><h2 className="font-semibold">Your personalized learning roadmap</h2></div>
        <p className="text-sm text-gray-500 mt-1 mb-4">Built transparently from skills missing in your applications—not a black-box score.</p>
        {roadmapSkills.length ? <div className="grid sm:grid-cols-3 gap-3">{roadmapSkills.map((skill, index) => <div key={skill} className="rounded-lg bg-blue-50 p-4"><span className="text-xs font-bold text-brand">STEP {index + 1}</span><p className="capitalize font-semibold text-navy mt-1">Strengthen {skill}</p><p className="text-xs text-gray-500 mt-1">Add a project or certificate, then update your profile.</p></div>)}</div> : <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">Apply to an opportunity to receive a tailored roadmap based on its required skills.</div>}
      </section>

      {skillGapData.length > 0 && (
        <div className="bg-card rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-navy mb-3">Skill Gap — Most Recent Application</h2>
          <SkillGapChart data={skillGapData} />
        </div>
      )}
    </DashboardShell>
  );
}
