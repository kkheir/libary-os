"use client";

import { useState, useEffect, useCallback } from "react";

/* ────────────────────────────────────────────────────────── */
/*  Types                                                      */
/* ────────────────────────────────────────────────────────── */

interface UserLite {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  genre: string | null;
  description: string | null;
  publishedYear: number | null;
  checkedOut: boolean;
  checkedOutAt: string | null;
  checkedOutById: string | null;
  checkedOutBy: { id: string; name: string | null; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface Recommendation {
  id: string;
  title: string;
  author: string;
  genre: string | null;
  checkedOut: boolean;
  reason: string;
  score: number;
}

interface Props {
  initialBooks: Book[];
  user: UserLite;
}

interface BookPayload {
  title: string;
  author: string;
  genre?: string;
  isbn?: string;
  description?: string;
  publishedYear?: string;
}

/* ────────────────────────────────────────────────────────── */
/*  Spinner                                                    */
/* ────────────────────────────────────────────────────────── */

function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Toast                                                      */
/* ────────────────────────────────────────────────────────── */

type ToastType = "success" | "error" | "info";

function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const color = type === "success"
    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
    : type === "error"
      ? "bg-red-50 border-red-200 text-red-800"
      : "bg-blue-50 border-blue-200 text-blue-800";

  const icon = type === "success" ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
  ) : type === "error" ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
  );

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium ${color}`}
         style={{ animation: "fade-up 0.25s ease both" }}>
      {icon} {message}
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">✕</button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  StatCard                                                   */
/* ────────────────────────────────────────────────────────── */

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
        <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  BookCard                                                   */
/* ────────────────────────────────────────────────────────── */

function BookCard({
  book,
  user,
  onCheckout,
  onCheckin,
  onDelete,
  onUpdate,
}: {
  book: Book;
  user: UserLite;
  onCheckout: (id: string) => void;
  onCheckin: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: BookPayload) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState<BookPayload>({
    title: book.title,
    author: book.author,
    genre: book.genre ?? "",
    isbn: book.isbn ?? "",
    description: book.description ?? "",
    publishedYear: book.publishedYear?.toString() ?? "",
  });

  const isAdmin = user.role === "ADMIN";
  const isBorrower = book.checkedOutById === user.id;

  function handleSaveEdit() {
    onUpdate(book.id, form);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-2xl bg-white border border-indigo-200 shadow-md p-5" style={{ animation: "fade-up 0.2s ease both" }}>
        <h3 className="text-sm font-bold text-indigo-700 mb-4 flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          Editing Book
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20" placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20" placeholder="Genre" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20" placeholder="ISBN" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 sm:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20" placeholder="Year published" value={form.publishedYear} onChange={(e) => setForm({ ...form, publishedYear: e.target.value })} />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSaveEdit} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">Save</button>
          <button onClick={() => setEditing(false)} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 truncate">{book.title}</h3>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${book.checkedOut ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
              {book.checkedOut ? "Borrowed" : "Available"}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">by {book.author}</p>

          <div className="flex flex-wrap gap-2 mt-2.5">
            {book.genre && (
              <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {book.genre}
              </span>
            )}
            {book.publishedYear && (
              <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {book.publishedYear}
              </span>
            )}
            {book.isbn && (
              <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                ISBN: {book.isbn}
              </span>
            )}
          </div>

          {book.description && (
            <p className="text-sm text-slate-500 mt-2 line-clamp-2">{book.description}</p>
          )}

          {book.checkedOut && book.checkedOutBy && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              Borrowed by {book.checkedOutBy.name || book.checkedOutBy.email}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 shrink-0">
          {!book.checkedOut && (
            <button onClick={() => onCheckout(book.id)} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors">
              Borrow
            </button>
          )}
          {book.checkedOut && isBorrower && (
            <button onClick={() => onCheckin(book.id)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors">
              Return
            </button>
          )}
          {isAdmin && (
            <>
              <button onClick={() => setEditing(true)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
                Edit
              </button>
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors">
                  Delete
                </button>
              ) : (
                <div className="flex gap-1">
                  <button onClick={() => { onDelete(book.id); setConfirmDelete(false); }} className="rounded-lg bg-red-600 px-2 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors">
                    Yes
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className="rounded-lg bg-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-300 transition-colors">
                    No
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Main DashboardClient                                       */
/* ────────────────────────────────────────────────────────── */

export default function DashboardClient({ initialBooks, user }: Props) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"catalog" | "ai">("catalog");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // AI recommendations
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [recSummary, setRecSummary] = useState("");
  const [recLoading, setRecLoading] = useState(false);

  // Add book form
  const [showAdd, setShowAdd] = useState(false);
  const [newBook, setNewBook] = useState<BookPayload>({ title: "", author: "", genre: "", isbn: "", description: "", publishedYear: "" });
  const [addLoading, setAddLoading] = useState(false);

  const isAdmin = user.role === "ADMIN";

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type });
  }, []);

  /* ─── Search ─── */
  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/books?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        setBooks(data.books);
      } catch { /* ignore */ }
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  /* ─── Fetch AI recs ─── */
  async function fetchRecs() {
    setRecLoading(true);
    try {
      const res = await fetch(`/api/ai/recommendations?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setRecs(data.recommendations ?? []);
      setRecSummary(data.summary ?? "");
    } catch {
      showToast("Failed to load AI picks", "error");
    }
    setRecLoading(false);
  }

  /* ─── Book actions ─── */
  async function handleCheckout(id: string) {
    try {
      const res = await fetch(`/api/books/${id}/checkout`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBooks((prev) => prev.map((b) => (b.id === id ? data.book : b)));
      showToast("Book borrowed successfully!");
    } catch {
      showToast("Failed to borrow book", "error");
    }
  }

  async function handleCheckin(id: string) {
    try {
      const res = await fetch(`/api/books/${id}/checkin`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBooks((prev) => prev.map((b) => (b.id === id ? data.book : b)));
      showToast("Book returned successfully!");
    } catch {
      showToast("Failed to return book", "error");
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setBooks((prev) => prev.filter((b) => b.id !== id));
      showToast("Book deleted");
    } catch {
      showToast("Failed to delete book", "error");
    }
  }

  async function handleUpdate(id: string, payload: BookPayload) {
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          publishedYear: payload.publishedYear ? Number(payload.publishedYear) : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBooks((prev) => prev.map((b) => (b.id === id ? data.book : b)));
      showToast("Book updated!");
    } catch {
      showToast("Failed to update book", "error");
    }
  }

  async function handleAddBook(e: React.FormEvent) {
    e.preventDefault();
    if (!newBook.title || !newBook.author) return;
    setAddLoading(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newBook,
          publishedYear: newBook.publishedYear ? Number(newBook.publishedYear) : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBooks((prev) => [data.book, ...prev]);
      setNewBook({ title: "", author: "", genre: "", isbn: "", description: "", publishedYear: "" });
      setShowAdd(false);
      showToast("Book added to catalog!");
    } catch {
      showToast("Failed to add book", "error");
    }
    setAddLoading(false);
  }

  /* ─── Stats ─── */
  const totalBooks = books.length;
  const available = books.filter((b) => !b.checkedOut).length;
  const borrowed = books.filter((b) => b.checkedOut).length;
  const myBorrowed = books.filter((b) => b.checkedOutById === user.id).length;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" style={{ animation: "fade-up 0.3s ease both" }}>
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>}
          value={totalBooks}
          label="Total Books"
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>}
          value={available}
          label="Available"
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
          value={borrowed}
          label="Borrowed"
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
          value={myBorrowed}
          label="My Borrows"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit" style={{ animation: "fade-up 0.35s ease both" }}>
        <button
          onClick={() => setTab("catalog")}
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 ${tab === "catalog" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          📚 Catalog
        </button>
        <button
          onClick={() => { setTab("ai"); fetchRecs(); }}
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 ${tab === "ai" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          ✨ AI Picks
        </button>
      </div>

      {/* ─── Catalog Tab ─── */}
      {tab === "catalog" && (
        <div style={{ animation: "fade-up 0.3s ease both" }}>
          {/* Search + Add */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder="Search books by title, author, genre…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAdd((v) => !v)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200 shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                {showAdd ? "Cancel" : "Add Book"}
              </button>
            )}
          </div>

          {/* Add Book Form */}
          {showAdd && isAdmin && (
            <form onSubmit={handleAddBook} className="rounded-2xl bg-white border border-indigo-200 shadow-md p-6 mb-6" style={{ animation: "fade-up 0.2s ease both" }}>
              <h3 className="text-sm font-bold text-indigo-700 mb-4 flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                New Book
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input required className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20" placeholder="Title *" value={newBook.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })} />
                <input required className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20" placeholder="Author *" value={newBook.author} onChange={(e) => setNewBook({ ...newBook, author: e.target.value })} />
                <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20" placeholder="Genre" value={newBook.genre} onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })} />
                <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20" placeholder="ISBN" value={newBook.isbn} onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })} />
                <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 sm:col-span-2" placeholder="Description" value={newBook.description} onChange={(e) => setNewBook({ ...newBook, description: e.target.value })} />
                <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20" placeholder="Year published" value={newBook.publishedYear} onChange={(e) => setNewBook({ ...newBook, publishedYear: e.target.value })} />
              </div>
              <button type="submit" disabled={addLoading} className="mt-4 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                {addLoading && <Spinner className="h-4 w-4" />}
                {addLoading ? "Adding…" : "Add Book"}
              </button>
            </form>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Spinner className="h-7 w-7 text-indigo-600" />
            </div>
          )}

          {/* Book list */}
          {!loading && books.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-lg font-bold text-slate-900">No books found</h3>
              <p className="text-sm text-slate-500 mt-1">
                {search ? "Try a different search term" : "The catalog is empty. Add some books to get started!"}
              </p>
            </div>
          )}

          {!loading && books.length > 0 && (
            <div className="grid gap-3">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  user={user}
                  onCheckout={handleCheckout}
                  onCheckin={handleCheckin}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── AI Picks Tab ─── */}
      {tab === "ai" && (
        <div style={{ animation: "fade-up 0.3s ease both" }}>
          {recLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <Spinner className="h-7 w-7 text-violet-600" />
                <p className="text-sm text-slate-500 font-medium">Analyzing your library…</p>
              </div>
            </div>
          )}

          {!recLoading && recs.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-lg font-bold text-slate-900">No recommendations yet</h3>
              <p className="text-sm text-slate-500 mt-1">Add more books to your catalog for AI-powered picks</p>
            </div>
          )}

          {!recLoading && recs.length > 0 && (
            <>
              {recSummary && (
                <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/50 p-5 mb-6">
                  <p className="text-sm text-violet-800 font-medium flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                    {recSummary}
                  </p>
                </div>
              )}

              <div className="grid gap-3">
                {recs.map((rec, i) => (
                  <div key={rec.id} className="rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-all p-5 flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 text-sm font-bold shrink-0">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">{rec.title}</h3>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${rec.checkedOut ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {rec.checkedOut ? "Borrowed" : "Available"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">by {rec.author}</p>
                      {rec.genre && <span className="inline-block mt-1.5 rounded-lg bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-600">{rec.genre}</span>}
                      <p className="text-sm text-slate-600 mt-2">{rec.reason}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                      {rec.score.toFixed(1)}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
