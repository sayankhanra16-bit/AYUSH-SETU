import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Building2, Landmark, User, Mail, Lock, Briefcase, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { key: 'student', label: 'Student', icon: GraduationCap, desc: 'Find skill-matched internships' },
  { key: 'industry', label: 'Industry', icon: Building2, desc: 'Hire skill-verified talent' },
  { key: 'institution', label: 'Institution', icon: Landmark, desc: 'Track skill-gap analytics' },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', organization: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === 'industry') navigate('/industry');
      else if (user.role === 'institution') navigate('/institution');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="w-9 h-9 rounded-lg bg-navy text-white flex items-center justify-center font-bold">A</div>
          <span className="font-bold text-xl text-navy">AYUSH-SETU</span>
        </div>

        <h1 className="text-2xl font-bold text-navy text-center">Create your account</h1>
        <p className="text-gray-500 text-sm text-center mt-1 mb-6">Pick your role to get started</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isActive = form.role === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => setForm({ ...form, role: r.key })}
                className={`relative text-center p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-brand bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center">
                    <Check size={12} />
                  </div>
                )}
                <Icon size={24} className={`mx-auto mb-2 ${isActive ? 'text-brand' : 'text-gray-400'}`} />
                <p className={`text-sm font-semibold ${isActive ? 'text-navy' : 'text-gray-600'}`}>{r.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Full name" value={form.name} onChange={update('name')} required
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>

          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" placeholder="Email" value={form.email} onChange={update('email')} required
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="password" placeholder="Password (min 6 characters)" value={form.password}
              onChange={update('password')} required minLength={6}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>

          {form.role !== 'student' && (
            <div className="relative">
              <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder={form.role === 'industry' ? 'Company name' : 'Institution name'}
                value={form.organization} onChange={update('organization')}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          )}

          <button disabled={loading}
            className="w-full bg-brand hover:bg-navy text-white py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm mt-6 text-center text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}