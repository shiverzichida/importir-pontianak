'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Lock, Mail, Ship } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErrorMsg(data.error || 'Login gagal.');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setErrorMsg('Koneksi bermasalah. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <div className="border-b border-white/15 px-4 py-2.5 text-center font-mono text-xs text-teal-300">
        0°00&apos;N 109°20&apos;E · PORTAL OPERASIONAL IMPORTIR PONTIANAK
      </div>

      <main
        id="main-content"
        className="flex-1 flex flex-col items-center justify-center p-4"
      >
        <div className="w-full max-w-md bg-white rounded-xl border border-slate-300 shadow-lg p-7 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-lg bg-navy text-teal-300 flex items-center justify-center shrink-0">
                <Ship className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-navy">
                  Admin Operasional
                </h1>
                <p className="text-xs text-slate-600">Importir Pontianak</p>
              </div>
            </div>
            <Link
              href="/"
              className="min-h-[40px] px-2.5 inline-flex items-center gap-1 rounded-md text-xs font-semibold text-slate-700 hover:text-navy hover:bg-slate-100"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Website
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold text-navy mb-1.5"
              >
                Email Admin
              </label>
              <div className="relative">
                <Mail
                  className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
                  aria-hidden="true"
                />
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@importirpontianak.id"
                  className="w-full min-h-[44px] rounded-lg border border-slate-300 pl-10 pr-3.5 py-2 text-sm text-slate-900 focus:border-teal"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-navy mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
                  aria-hidden="true"
                />
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin"
                  className="w-full min-h-[44px] rounded-lg border border-slate-300 pl-10 pr-3.5 py-2 text-sm text-slate-900 focus:border-teal"
                />
              </div>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="rounded-lg bg-rose-50 border border-rose-300 px-3.5 py-2.5 text-xs font-semibold text-rose-800"
              >
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-lg bg-navy hover:bg-navy-light disabled:opacity-60 text-white font-bold text-sm transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Memverifikasi...
                </>
              ) : (
                'Masuk ke Dashboard Admin'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
