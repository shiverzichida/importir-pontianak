import CatalogClient from '@/components/public/CatalogClient';
import { getPublicCatalogProducts, getPublicConfig } from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export default async function KatalogPage() {
  const [config, products] = await Promise.all([
    getPublicConfig(),
    getPublicCatalogProducts(),
  ]);

  return <CatalogClient config={config} products={products} />;
}
