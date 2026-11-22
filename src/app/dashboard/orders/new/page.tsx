import { redirect } from 'next/navigation';
import MemberNewOrderClient from '@/components/dashboard/MemberNewOrderClient';
import { getActiveCustomerProfile } from '@/lib/customer-data';
import {
  getCatalogProductBySlug,
  getLclBatchByCode,
  getPublicConfig,
  getPublicLclBatches,
} from '@/lib/public-data';
import type { ServiceType } from '@/lib/types';

export const dynamic = 'force-dynamic';

const VALID_SERVICES: ServiceType[] = [
  'titip_beli',
  'forwarder',
  'transfer_valas',
];

export default async function MemberNewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ catalog?: string; batch?: string; service?: string }>;
}) {
  const params = await searchParams;
  const catalogSlug = (params.catalog || '').trim();
  const batchCode = (params.batch || '').trim();
  const serviceParam = (params.service || '').trim() as ServiceType;
  const initialService = VALID_SERVICES.includes(serviceParam)
    ? serviceParam
    : null;

  const profile = await getActiveCustomerProfile();
  if (!profile) {
    const query = new URLSearchParams();
    if (catalogSlug) query.set('catalog', catalogSlug);
    if (batchCode) query.set('batch', batchCode);
    if (initialService) query.set('service', initialService);
    const nextUrl = query.toString()
      ? `/dashboard/orders/new?${query.toString()}`
      : '/dashboard/orders/new';
    redirect(`/login?next=${encodeURIComponent(nextUrl)}`);
  }

  const [config, batches, initialCatalogProduct, initialLclBatch] =
    await Promise.all([
      getPublicConfig(),
      getPublicLclBatches(),
      catalogSlug ? getCatalogProductBySlug(catalogSlug) : Promise.resolve(null),
      batchCode ? getLclBatchByCode(batchCode) : Promise.resolve(null),
    ]);

  return (
    <MemberNewOrderClient
      profile={profile}
      config={config}
      batches={batches}
      initialCatalogProduct={initialCatalogProduct}
      initialLclBatch={initialLclBatch}
      initialService={initialService}
    />
  );
}
