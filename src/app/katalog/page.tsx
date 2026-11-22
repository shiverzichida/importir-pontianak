import CatalogClient from '@/components/public/CatalogClient';
import {
  getPublicCatalogProducts,
  getPublicConfig,
  getPublicLclBatches,
} from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export default async function KatalogPage() {
  const [config, products, batches] = await Promise.all([
    getPublicConfig(),
    getPublicCatalogProducts(),
    getPublicLclBatches(),
  ]);

  return <CatalogClient config={config} products={products} batches={batches} />;
}
