import { Link } from 'react-router-dom';
import { School, Zap, ShieldCheck, BarChart3, ClipboardList, ArrowRight, CheckCircle2 } from 'lucide-react';

const features = [
  { icon: Zap, title: 'Smart Categorization', desc: 'Issues are automatically categorized and prioritized based on their description, so urgent problems get attention first.' },
  { icon: ClipboardList, title: 'Full Tracking', desc: 'Follow every issue from Reported to In Progress to Resolved with a clear visual timeline.' },
  { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Students report and track issues; campus staff manage, assign and resolve them securely.' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Admins get real-time dashboards showing issue trends by category, priority, building and time.' },
];

const steps = [
  { title: 'Report an issue', desc: 'Describe the problem, pick a location, and optionally attach a photo.' },
  { title: 'Get auto-prioritized', desc: 'Our rule-based engine assigns a category and priority instantly.' },
  { title: 'Track resolution', desc: 'Watch your issue move from Reported to In Progress to Resolved.' },
];

const statCards = [
  { stat: '500+', label: 'Issues Resolved', bg: 'bg-black' },
  { stat: '24h', label: 'Avg. Response', bg: 'bg-wine-700' },
  { stat: '98%', label: 'Student Satisfaction', bg: 'bg-black' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <School size={24} /> Smart Campus
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-white/80 hover:text-white">Log in</Link>
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-lg bg-wine-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-wine-700">Get Started</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-primary-600">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <span className="inline-flex items-center rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
            Built for modern campuses
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-black sm:text-5xl">
            Report campus issues.<br className="hidden sm:block" /> Get them fixed, faster.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-black/80">
            A smart issue reporting system for students and staff — damaged furniture, water leaks,
            electrical faults or cleanliness problems, automatically categorized, prioritized and tracked to resolution.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-lg bg-wine-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-wine-700">
              Report an Issue <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-6 py-3 text-base font-semibold text-black transition-colors hover:bg-black hover:text-white">Log in</Link>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6">
            {statCards.map(({ stat, label, bg }) => (
              <div key={label} className={`rounded-xl p-5 shadow-cardHover ${bg}`}>
                <p className="text-2xl font-extrabold text-white">{stat}</p>
                <p className="mt-1 text-xs font-medium text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-black">Everything you need to manage campus issues</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={f.title} className="card p-6">
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg text-white ${i % 2 === 0 ? 'bg-primary-600' : 'bg-wine-600'}`}>
                <f.icon size={22} />
              </div>
              <h3 className="font-semibold text-black">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-wine-700 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold text-white">How it works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="relative rounded-xl bg-white p-6 shadow-card">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-black">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black py-20 text-center">
        <div className="mx-auto max-w-4xl px-6">
          <CheckCircle2 className="mx-auto mb-4 text-primary-400" size={40} />
          <h2 className="text-3xl font-bold text-white">Ready to make your campus better?</h2>
          <p className="mt-3 text-white/70">Join students already reporting and resolving issues faster.</p>
          <Link to="/register" className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-wine-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-wine-700">Create your account</Link>
        </div>
      </section>

      <footer className="bg-primary-600 py-8 text-center text-sm text-black/70">
        <p>© {new Date().getFullYear()} Smart Campus Issue Reporting System. Built for a campus hackathon project.</p>
      </footer>
    </div>
  );
}
