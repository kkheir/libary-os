import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";

export default async function Home() {
  const session = await getServerAuthSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-violet-200/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-sky-100/30 blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl px-6 text-center" style={{ animation: "fade-up 0.5s ease both" }}>
        {/* Logo */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>

        <h1 className="text-6xl font-extrabold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            LibraryOS
          </span>
        </h1>

        <p className="text-xl text-slate-600 mb-3 font-medium">
          Your intelligent library, reimagined.
        </p>
        <p className="text-sm text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
          Manage your book catalog, borrow &amp; return with ease, and discover your next great read with AI-powered recommendations.
        </p>

        {/* Feature cards */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { icon: "📚", label: "Smart Catalog" },
            { icon: "🔐", label: "Role-Based Auth" },
            { icon: "🤖", label: "AI Picks" },
            { icon: "⚡", label: "Instant Search" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/60 px-4 py-2 text-sm text-slate-600 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>{icon}</span>
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white/60 backdrop-blur-sm px-8 py-3.5 text-base font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 hover:-translate-y-0.5 transition-all duration-200"
          >
            Create account
          </Link>
        </div>

        {/* Demo hint */}
        <div className="mt-12 inline-flex items-center gap-2 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200/60 px-4 py-2.5">
          <span className="text-xs text-slate-400">Demo:</span>
          <code className="text-xs font-mono text-indigo-600 bg-indigo-50 rounded px-1.5 py-0.5">admin@library.local</code>
          <span className="text-xs text-slate-300">/</span>
          <code className="text-xs font-mono text-indigo-600 bg-indigo-50 rounded px-1.5 py-0.5">Admin123!</code>
        </div>
      </div>
    </div>
  );
}

