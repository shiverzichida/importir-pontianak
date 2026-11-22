'use client';

import { useState } from 'react';
import { Check, Copy, MapPin, Phone, Tag } from 'lucide-react';
import { useLanguage } from '@/components/public/LanguageProvider';
import { getPortalDictionary } from '@/lib/i18n/portal-dictionaries';
import type { CustomerProfile, OriginCountry, WarehouseInfo } from '@/lib/types';
import MemberShell from './MemberShell';

interface MemberWarehousesClientProps {
  profile: CustomerProfile;
  warehouses: WarehouseInfo[];
}

export default function MemberWarehousesClient({
  profile,
  warehouses,
}: MemberWarehousesClientProps) {
  const { locale, dict } = useLanguage();
  const portal = getPortalDictionary(locale);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const getMarkingForOrigin = (origin: OriginCountry) => {
    const prefix = origin === 'china' ? 'CN' : origin === 'malaysia' ? 'MY' : 'SG';
    return `PNK-${prefix}-${profile.marking_code_base}`;
  };

  const copyText = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <MemberShell profile={profile}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            {portal.warehouses.title}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {portal.warehouses.subtitle}
          </p>
        </div>

        <div className="space-y-6">
          {warehouses.map((w) => {
            const marking = getMarkingForOrigin(w.origin_country);
            const localAddr = w.address_local.replace(/\[MARKING_CODE\]/g, marking);
            const engAddr = w.address_english.replace(/\[MARKING_CODE\]/g, marking);
            const recipient = w.recipient_format.replace(
              /\[MARKING_CODE\]/g,
              marking
            );
            const meta =
              locale === 'id'
                ? { name: w.warehouse_name, city: w.city, notes: w.notes }
                : dict.warehouse.localizedMeta[w.origin_country];

            return (
              <article
                key={w.id}
                className="bg-white rounded-2xl border border-[#DCE6F5] shadow-sm overflow-hidden"
              >
                <div className="bg-gradient-to-r from-[#0C2B6B] to-[#1748A8] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-gold uppercase">
                      {dict.domain.originLabels[w.origin_country]}
                    </span>
                    <h2 className="text-lg font-extrabold">{meta.name}</h2>
                    <p className="text-xs text-blue-100 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                      {meta.city} · {w.postal_code}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 font-mono text-xs font-semibold">
                      <Phone className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                      {w.phone}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText(`mk-${w.id}`, marking)}
                      className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 rounded-full bg-gold hover:bg-gold-dark text-ink font-mono text-xs font-extrabold transition-colors"
                    >
                      {copiedKey === `mk-${w.id}` ? (
                        <>
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          {portal.warehouses.copiedBtn}: {marking}
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          {marking}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-ink">
                          {portal.warehouses.localAddrLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(`loc-${w.id}`, localAddr)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
                        >
                          {copiedKey === `loc-${w.id}` ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-wa" aria-hidden="true" />
                              {portal.warehouses.copiedBtn}
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                              {portal.warehouses.copyAddrBtn}
                            </>
                          )}
                        </button>
                      </div>
                      <div className="rounded-xl bg-ice border border-[#DCE6F5] p-4 text-sm font-medium text-ink leading-relaxed">
                        {localAddr}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-ink">
                          {portal.warehouses.engAddrLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(`eng-${w.id}`, engAddr)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
                        >
                          {copiedKey === `eng-${w.id}` ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-wa" aria-hidden="true" />
                              {portal.warehouses.copiedBtn}
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                              {portal.warehouses.copyAddrBtn}
                            </>
                          )}
                        </button>
                      </div>
                      <div className="rounded-xl bg-ice border border-[#DCE6F5] p-3.5 text-xs text-slate-700 leading-relaxed">
                        {engAddr}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-ink">
                          {portal.warehouses.recipientLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(`rec-${w.id}`, recipient)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
                        >
                          {copiedKey === `rec-${w.id}` ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-wa" aria-hidden="true" />
                              {portal.warehouses.copiedBtn}
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                              {portal.overview.copyBtn}
                            </>
                          )}
                        </button>
                      </div>
                      <div className="rounded-xl bg-[#EEF5FF] border border-[#C6DAFA] p-4 flex items-center gap-3">
                        <Tag className="h-5 w-5 text-brand shrink-0" aria-hidden="true" />
                        <span className="font-mono font-bold text-ink text-sm">
                          {recipient}
                        </span>
                      </div>
                    </div>

                    {meta.notes && (
                      <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 text-xs text-amber-950 leading-relaxed">
                        <strong className="block mb-1">
                          {portal.warehouses.notesLabel}
                        </strong>
                        {meta.notes}
                      </div>
                    )}

                    <div className="text-xs text-slate-700">
                      {portal.warehouses.supportedMethodsLabel}{' '}
                      <span className="font-bold text-brand">
                        {w.supported_methods
                          .map((m) =>
                            m === 'udara' || m === 'laut' || m === 'darat'
                              ? dict.domain.methodLabels[m]
                              : m
                          )
                          .join(' | ')}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </MemberShell>
  );
}
