import LandingClient from '@/components/public/LandingClient';
import {
  getCatalogProductBySlug,
  getPublicCatalogProducts,
  getPublicConfig,
} from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ catalog?: string }>;
}) {
  const params = await searchParams;
  const catalogSlug = (params.catalog || '').trim();

  const [config, featuredCatalog, initialCatalogProduct] = await Promise.all([
    getPublicConfig(),
    getPublicCatalogProducts({ featuredOnly: true, limit: 3 }),
    catalogSlug ? getCatalogProductBySlug(catalogSlug) : Promise.resolve(null),
  ]);

  const showcaseProducts =
    featuredCatalog.length > 0
      ? featuredCatalog
      : await getPublicCatalogProducts({ limit: 3 });

  return (
    <LandingClient
      config={config}
      featuredProducts={showcaseProducts}
      initialCatalogProduct={initialCatalogProduct}
    />
  );
}
