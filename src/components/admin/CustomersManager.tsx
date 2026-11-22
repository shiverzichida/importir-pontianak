'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  Loader2,
  Search,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import { formatDateWib } from '@/lib/format';
import type { CustomerProfile } from '@/lib/types';

interface AdminCustomerRow extends CustomerProfile {
  admin_notes: string | null;
  orders_count: number;
  shipments_count: number;
}

export default function CustomersManager() {
  const [customers, setCustomers] = useState<AdminCustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selected, setSelected] = useState<AdminCustomerRow | null>(null);
  const [editActive, setEditActive] = useState(true);
  const [editMarkingBase, setEditMarkingBase] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'ok' | 'err';
    msg: string;
  } | null>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search.trim()) params.set('q', search.trim());
      const res = await fetch(`/api/admin/customers?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        setLoadError('Gagal memuat daftar member.');
        setCustomers([]);
        return;
      }
      const data = (await res.json()) as { customers?: AdminCustomerRow[] };
      setCustomers(data.customers || []);
    } catch {
      setLoadError('Koneksi bermasalah saat memuat daftar member.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  const openModal = (cust: AdminCustomerRow) => {
    setSelected(cust);
    setEditActive(cust.is_active);
    setEditMarkingBase(cust.marking_code_base);
    setEditNotes(cust.admin_notes || '');
    setFeedback(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/customers/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: editActive,
          marking_code_base: editMarkingBase,
          admin_notes: editNotes,
        }),
      });
      const data = (await res.json()) as {
        customer?: AdminCustomerRow;
        error?: string;
      };
      if (!res.ok || !data.customer) {
        setFeedback({ type: 'err', msg: data.error || 'Gagal menyimpan.' });
      } else {
        setSelected((prev) =>
          prev
            ? {
                ...prev,
                ...data.customer,
              }
            : null
        );
        setFeedback({ type: 'ok', msg: 'Data member diperbarui.' });
        loadCustomers();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">
          Manajemen Member & Customer
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Lihat akun importir yang terdaftar, kelola status aktif, kode dasar
          marking gudang, serta catatan internal.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-300 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <label htmlFor="customer-search" className="sr-only">
            Cari member
          </label>
          <Search
            className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
            aria-hidden="true"
          />
          <input
            id="customer-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Member Code, nama, toko, email, WA, atau marking..."
            className="w-full min-h-[44px] rounded-lg border border-slate-300 pl-9 pr-3.5 py-2 text-sm focus:border-teal"
          />
        </div>

        <div>
          <label htmlFor="customer-status-filter" className="sr-only">
            Filter status member
          </label>
          <select
            id="customer-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-300 overflow-x-auto">
        {loading ? (
          <div className="p-10 flex items-center justify-center gap-2 text-sm text-slate-600">
            <Loader2
              className="h-5 w-5 animate-spin text-teal-dark"
              aria-hidden="true"
            />
            Memuat daftar member...
          </div>
        ) : loadError ? (
          <div className="p-8 text-center space-y-3" role="alert">
            <p className="text-sm font-semibold text-rose-800">{loadError}</p>
            <button
              type="button"
              onClick={loadCustomers}
              className="min-h-[44px] px-4 rounded-lg bg-navy text-white text-xs font-bold"
            >
              Coba Muat Ulang
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-600">
            Belum ada member yang cocok dengan filter.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-paper border-b border-slate-300 text-xs font-bold text-navy">
                <th className="px-4 py-3">Member & Marking</th>
                <th className="px-4 py-3">Nama & Usaha</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3">Aktivitas</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="font-mono font-bold text-teal-dark text-xs">
                      {c.member_code}
                    </div>
                    <div className="font-mono text-xs text-navy font-semibold mt-0.5">
                      Marking: {c.marking_code_base}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 max-w-xs">
                    <div className="font-bold text-navy truncate">
                      {c.full_name}
                    </div>
                    <div className="text-xs text-slate-600 truncate">
                      {c.company_name || '-'} · {c.default_destination_city}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                    <div className="text-slate-800">{c.email}</div>
                    <div className="font-mono text-slate-600 mt-0.5">
                      +{c.whatsapp}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                    <div className="font-mono font-bold text-navy">
                      {c.orders_count} order · {c.shipments_count} resi
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      Login:{' '}
                      {c.last_login_at ? formatDateWib(c.last_login_at) : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {c.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border bg-emerald-50 text-emerald-800 border-emerald-200">
                        <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border bg-rose-50 text-rose-800 border-rose-200">
                        <UserX className="h-3.5 w-3.5" aria-hidden="true" />
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openModal(c)}
                      className="min-h-[38px] inline-flex items-center gap-1 rounded-md bg-navy hover:bg-navy-light text-white text-xs font-bold px-3 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      Kelola
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/65 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-300 overflow-hidden">
            <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="font-mono text-xs text-teal-300 font-bold">
                  {selected.member_code}
                </div>
                <h2 className="font-bold text-base">{selected.full_name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-md hover:bg-white/10"
                aria-label="Tutup modal member"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-sm">
              <div className="rounded-lg bg-paper border border-slate-300 p-4 text-xs space-y-1.5">
                <div>
                  <strong>Email:</strong> {selected.email}
                </div>
                <div>
                  <strong>WhatsApp:</strong>{' '}
                  <span className="font-mono">+{selected.whatsapp}</span>
                </div>
                <div>
                  <strong>Usaha:</strong> {selected.company_name || '-'}
                </div>
                <div>
                  <strong>Tujuan Default:</strong>{' '}
                  {selected.default_destination_city}
                </div>
                {selected.address_detail && (
                  <div>
                    <strong>Alamat Lengkap:</strong> {selected.address_detail}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="cust-marking-base"
                  className="block text-xs font-bold text-navy mb-1"
                >
                  Kode Dasar Marking (tanpa PNK-CN/MY/SG-)
                </label>
                <input
                  id="cust-marking-base"
                  type="text"
                  required
                  value={editMarkingBase}
                  onChange={(e) =>
                    setEditMarkingBase(
                      e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                    )
                  }
                  className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                />
                <p className="text-[11px] text-slate-600 mt-1">
                  Contoh hasil gudang: PNK-CN-{editMarkingBase || 'TOKO'} ·
                  PNK-MY-{editMarkingBase || 'TOKO'}
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-navy cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Akun Member Aktif (dapat login & mengajukan order)
                </label>
              </div>

              <div>
                <label
                  htmlFor="cust-admin-notes"
                  className="block text-xs font-bold text-navy mb-1"
                >
                  Catatan Internal Admin
                </label>
                <textarea
                  id="cust-admin-notes"
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="cth: Importir grosir langganan kloter China 2x/bulan"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              {feedback && (
                <div
                  role="status"
                  className={`rounded-lg px-4 py-3 text-xs font-semibold flex items-center gap-2 ${
                    feedback.type === 'ok'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-50 text-rose-900 border border-rose-300'
                  }`}
                >
                  {feedback.type === 'ok' && (
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <span>{feedback.msg}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="min-h-[44px] rounded-lg border border-slate-300 px-4 text-xs font-bold text-slate-800"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[44px] rounded-lg bg-navy hover:bg-navy-light disabled:opacity-60 text-white font-bold px-5 text-xs"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
