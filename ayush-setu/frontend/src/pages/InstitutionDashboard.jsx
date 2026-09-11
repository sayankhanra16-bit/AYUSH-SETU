import { useEffect, useState } from 'react';
import { Users, Briefcase, BarChart3, Download, TrendingUp, AlertTriangle, Printer } from 'lucide-react';
import api from '../api/axios';
import DashboardShell from '../components/DashboardShell';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { SkeletonStatRow, SkeletonCard } from '../components/Skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function InstitutionDashboard() {
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState({ totalStudents: 0, totalOpportunities: 0 });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    api.get('/analytics/skill-gap').then((res) => setData(res.data));
    api.get('/analytics/summary').then((res) => setSummary(res.data));
    api.get('/analytics/departments').then((res) => setDepartments(res.data));
  }, []);

  if (data === null) {
    return (
      <DashboardShell title="Institution Dashboard" subtitle="Skill demand vs. student readiness, at a glance">
        <SkeletonStatRow count={3} />
        <SkeletonCard />
      </DashboardShell>
    );
  }

  const gapData = data.map((item) => ({ ...item, gap: Math.max(0, item.demand - item.supply) }));
  const highPriorityGaps = [...gapData].sort((a, b) => b.gap - a.gap).slice(0, 3);
  const readiness = data.length ? Math.round((data.reduce((sum, item) => sum + Math.min(item.supply / Math.max(item.demand, 1), 1), 0) / data.length) * 100) : 0;
  const exportReport = () => {
    const csv = ['Skill,Industry demand,Student supply,Gap', ...gapData.map((item) => `${item.skill},${item.demand},${item.supply},${item.gap}`)].join('\n');
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    anchor.download = 'ayush-setu-skill-gap-report.csv';
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  return (
    <DashboardShell title="Institution Dashboard" subtitle="Skill demand vs. student readiness, at a glance">
      <div className="rounded-2xl bg-gradient-to-r from-navy via-brand to-blue-500 text-white p-6 mb-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div><p className="text-blue-100 text-sm font-medium">INSTITUTIONAL INTELLIGENCE</p><h2 className="text-2xl font-bold mt-1">Turn market demand into curriculum action.</h2><p className="text-white/80 text-sm mt-2">See where your learners are ready—and where intervention will have the biggest impact.</p></div>
        <div className="flex flex-wrap gap-2"><button onClick={exportReport} className="inline-flex items-center justify-center gap-2 bg-white text-navy rounded-lg px-4 py-2.5 font-semibold hover:bg-blue-50 transition"><Download size={17} /> Export CSV</button><button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 bg-white/15 border border-white/30 rounded-lg px-4 py-2.5 font-semibold hover:bg-white/25 transition"><Printer size={17} /> Save as PDF</button></div>
      </div>
      <div className="flex gap-4 mb-7 flex-wrap">
        <StatCard icon={Users} color="brand" label="Total Students" value={summary.totalStudents} />
        <StatCard icon={Briefcase} color="accent" label="Opportunities Posted" value={summary.totalOpportunities} />
        <StatCard icon={BarChart3} color="success" label="Skills Tracked" value={data.length} />
        <StatCard icon={TrendingUp} color="navy" label="Market Readiness" value={`${readiness}%`} hint="Supply meeting demand" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <section className="lg:col-span-2 bg-card rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 text-navy mb-1"><AlertTriangle size={19} className="text-accent" /><h2 className="font-semibold">Priority intervention areas</h2></div>
          <p className="text-sm text-gray-500 mb-4">Skills where industry demand currently exceeds student supply.</p>
          {highPriorityGaps.length ? <div className="space-y-3">{highPriorityGaps.map((item) => <div key={item.skill} className="flex items-center gap-3"><span className="capitalize w-28 text-sm font-medium text-navy truncate">{item.skill}</span><div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden"><div className="bg-accent h-full rounded-full" style={{ width: `${Math.min(100, item.gap / Math.max(item.demand, 1) * 100)}%` }} /></div><span className="text-xs text-gray-500 whitespace-nowrap">Gap: {item.gap}</span></div>)}</div> : <p className="text-sm text-gray-500">No gaps yet—add student skills and industry opportunities to generate insights.</p>}
        </section>
        <section className="bg-card rounded-xl shadow-sm p-6 border border-green-100"><p className="text-xs uppercase tracking-wider font-semibold text-success">Recommended next step</p><h3 className="font-semibold text-navy mt-2">Plan a focused skill sprint</h3><p className="text-sm text-gray-500 mt-2">Use the top gaps to organize workshops, certifications, or industry mentor sessions.</p><div className="mt-5 rounded-lg bg-green-50 text-success text-sm px-3 py-2">Data refreshes whenever roles and skills are updated.</div></section>
      </div>

      <section className="bg-card rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-navy">Department / cohort coverage</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">See which learner groups are represented in the platform.</p>
        {departments.length ? <div className="flex flex-wrap gap-3">{departments.map((item) => <div key={item.department} className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3"><p className="font-medium text-navy">{item.department}</p><p className="text-xs text-gray-500">{item.students} student{item.students === 1 ? '' : 's'}</p></div>)}</div> : <p className="text-sm text-gray-500">Students can add their department in Career preferences to populate this view.</p>}
      </section>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <section className="lg:col-span-2 bg-card rounded-xl shadow-sm p-6"><h2 className="font-semibold text-navy">Skill readiness heat map</h2><p className="text-sm text-gray-500 mt-1 mb-4">Darker cells signal higher demand; orange indicates a larger readiness gap.</p><div className="overflow-x-auto"><div className="min-w-[520px] grid grid-cols-[1.4fr_repeat(3,1fr)] text-sm gap-px bg-slate-100 rounded-lg overflow-hidden"><div className="bg-slate-50 p-3 font-semibold text-gray-500">Skill</div><div className="bg-slate-50 p-3 font-semibold text-gray-500">Demand</div><div className="bg-slate-50 p-3 font-semibold text-gray-500">Supply</div><div className="bg-slate-50 p-3 font-semibold text-gray-500">Gap</div>{gapData.slice(0, 8).flatMap((item) => [<div key={`${item.skill}-n`} className="bg-white p-3 capitalize font-medium text-navy">{item.skill}</div>,<div key={`${item.skill}-d`} className="p-3 text-center text-navy" style={{ backgroundColor: `rgba(0,112,192,${Math.min(.12 + item.demand / 12, .65)})` }}>{item.demand}</div>,<div key={`${item.skill}-s`} className="bg-white p-3 text-center">{item.supply}</div>,<div key={`${item.skill}-g`} className="p-3 text-center font-semibold" style={{ backgroundColor: `rgba(237,125,49,${Math.min(.08 + item.gap / 10, .65)})` }}>{item.gap}</div>])}</div></div></section>
        <section className="bg-card rounded-xl shadow-sm p-6"><p className="text-xs tracking-wider font-semibold text-brand">WHAT CHANGED</p><h2 className="font-semibold text-navy mt-2">Live marketplace signals</h2><ul className="mt-4 space-y-4 text-sm text-gray-600"><li><strong className="text-navy">{summary.totalOpportunities}</strong> active opportunities are shaping demand.</li><li><strong className="text-navy">{data.length}</strong> skills are currently tracked across the ecosystem.</li><li>Focus the next workshop on <strong className="text-accent capitalize">{highPriorityGaps[0]?.skill || 'emerging skills'}</strong> to reduce the largest gap.</li></ul></section>
      </div>

      <div className="bg-card rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-navy mb-3">Skill Demand vs. Student Readiness</h2>
        {data.length === 0 ? (
          <EmptyState icon={BarChart3} title="Not enough data yet"
            description="Post some opportunities and add student skills to see this chart populate." />
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={data}>
              <XAxis dataKey="skill" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="demand" fill="#ED7D31" name="Industry Demand" />
              <Bar dataKey="supply" fill="#0070C0" name="Student Supply" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardShell>
  );
}
