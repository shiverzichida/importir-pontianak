import LandingClient from '@/components/public/LandingClient';
import {
  getCatalogProductBySlug,
  getLclBatchByCode,
  getPublicCatalogProducts,
  getPublicConfig,
  getPublicLclBatches,
} from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ catalog?: string; batch?: string }>;
}) {
  const params = await searchParams;
  const catalogSlug = (params.catalog || '').trim();
  const batchCode = (params.batch || '').trim();

  const [
    config,
    featuredCatalog,
    lclBatches,
    initialCatalogProduct,
    initialLclBatch,
  ] = await Promise.all([
    getPublicConfig(),
    getPublicCatalogProducts({ featuredOnly: true, limit: 3 }),
    getPublicLclBatches(3),
    catalogSlug ? getCatalogProductBySlug(catalogSlug) : Promise.resolve(null),
    batchCode ? getLclBatchByCode(batchCode) : Promise.resolve(null),
  ]);

  const showcaseProducts =
    featuredCatalog.length > 0
      ? featuredCatalog
      : await getPublicCatalogProducts({ limit: 3 });

  return (
    <LandingClient
      config={config}
      featuredProducts={showcaseProducts}
      lclBatches={lclBatches}
      initialCatalogProduct={initialCatalogProduct}
      initialLclBatch={initialLclBatch}
    />
  );
}
