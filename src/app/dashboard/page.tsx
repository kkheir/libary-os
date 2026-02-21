import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import LogoutButton from "./logout-button";
import DashboardClient from "./DashboardClient";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.email) redirect("/login");

  const books = await prisma.book.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      checkedOutBy: { select: { id: true, name: true, email: true } },
    },
  });

  const user = {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email,
    role: session.user.role ?? "MEMBER",
  };

  const initials = user.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* ─── Sticky top bar ─── */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">LibraryOS</span>
            </span>
          </div>

          {/* Right: user info + logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold text-slate-800">{user.name || user.email}</span>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md mt-0.5 ${user.role === "ADMIN" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                {user.role}
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-md shadow-indigo-500/20">
              {initials}
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* ─── Main content ─── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardClient
          initialBooks={JSON.parse(JSON.stringify(books))}
          user={user}
        />
      </main>
    </div>
  );
}
