'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Container } from 'lucide-react';
import { useLanguage } from '@/components/public/LanguageProvider';
import RfqFormSection from '@/components/public/RfqFormSection';
import { getPortalDictionary } from '@/lib/i18n/portal-dictionaries';
import {
  catalogProductToPrefill,
  consumePendingOrderPrefill,
  lclBatchToPrefill,
} from '@/lib/order-prefill';
import type {
  CalculatorPrefill,
  CatalogProduct,
  CustomerProfile,
  LclBatch,
  PublicConfig,
  ServiceType,
} from '@/lib/types';
import MemberShell from './MemberShell';

interface MemberNewOrderClientProps {
  profile: CustomerProfile;
  config: PublicConfig;
  batches: LclBatch[];
  initialCatalogProduct: CatalogProduct | null;
  initialLclBatch: LclBatch | null;
  initialService: ServiceType | null;
}

export default function MemberNewOrderClient({
  profile,
  config,
  batches,
  initialCatalogProduct,
  initialLclBatch,
  initialService,
}: MemberNewOrderClientProps) {
  const { locale } = useLanguage();
  const portal = getPortalDictionary(locale);

  const [prefill, setPrefill] = useState<CalculatorPrefill | null>(() => {
    if (initialCatalogProduct) {
      return catalogProductToPrefill(
        initialCatalogProduct,
        profile.default_destination_city
      );
    }
    if (initialLclBatch) {
      return lclBatchToPrefill(initialLclBatch, profile.default_destination_city);
    }
    return null;
  });

  const [serviceTrigger] = useState<{
    service: ServiceType;
    nonce: number;
  } | null>(() =>
    initialService ? { service: initialService, nonce: 1 } : null
  );

  useEffect(() => {
    if (initialCatalogProduct || initialLclBatch) return;
    const saved = consumePendingOrderPrefill();
    if (saved) {
      setPrefill(saved);
    }
  }, [initialCatalogProduct, initialLclBatch]);

  return (
    <MemberShell profile={profile}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {portal.newOrder.backToOverview}
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              {portal.newOrder.title}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {portal.newOrder.subtitle}
            </p>
          </div>
        </div>

        {batches.filter((b) => b.status === 'open' || b.status === 'almost_full')
          .length > 0 && (
          <div className="rounded-xl bg-[#EEF5FF] border border-[#BFD6F9] px-4 py-3 text-xs text-ink flex items-center gap-2">
            <Container className="h-4 w-4 text-brand shrink-0" aria-hidden="true" />
            <span>{portal.newOrder.selectBatchHint}</span>
          </div>
        )}

        <RfqFormSection
          destinations={config.destinations}
          lclBatches={batches}
          prefill={prefill}
          serviceTrigger={serviceTrigger}
          onClearPrefill={() => setPrefill(null)}
          embedded
        />
      </div>
    </MemberShell>
  );
}
