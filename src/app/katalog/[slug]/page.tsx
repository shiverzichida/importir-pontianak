import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import CatalogDetailClient from '@/components/public/CatalogDetailClient';
import { formatIdr, formatNumberId } from '@/lib/format';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/i18n/types';
import {
  getCatalogProductBySlug,
  getPublicConfig,
  getPublicLclBatches,
  getRelatedCatalogProducts,
} from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) {
    return {
      title: 'Produk Tidak Ditemukan | Importir Pontianak',
    };
  }

  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
  const dict = getDictionary(locale);

  const rmbMin = formatNumberId(
    Number(product.price_rmb_min),
    Number(product.price_rmb_min) % 1 === 0 ? 0 : 2
  );
  const rmbMax = formatNumberId(
    Number(product.price_rmb_max),
    Number(product.price_rmb_max) % 1 === 0 ? 0 : 2
  );
  const rmbText =
    Number(product.price_rmb_max) > Number(product.price_rmb_min)
      ? `RMB ${rmbMin}-${rmbMax}`
      : `RMB ${rmbMin}`;

  const ogTitle = `${product.title} | ${dict.catalog.scaleBadges[product.shipment_scale]}`;
  const ogDescription = `${rmbText}/${product.unit_label} · Kalbar: ${formatIdr(product.est_sell_idr_min)}-${formatIdr(product.est_sell_idr_max)} (${product.margin_note}). ${product.why_pontianak}`;

  return {
    title: `${product.title} | Importir Pontianak`,
    description: ogDescription.slice(0, 220),
    openGraph: {
      type: 'website',
      title: ogTitle,
      description: ogDescription.slice(0, 220),
      url: `/katalog/${product.slug}`,
      images: [
        {
          url: product.image_url,
          width: 1200,
          height: 900,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription.slice(0, 220),
      images: [product.image_url],
    },
  };
}

export default async function KatalogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const [config, relatedProducts, batches] = await Promise.all([
    getPublicConfig(),
    getRelatedCatalogProducts(product.id, product.category, 3),
    getPublicLclBatches(3),
  ]);

  return (
    <CatalogDetailClient
      config={config}
      product={product}
      relatedProducts={relatedProducts}
      batches={batches}
    />
  );
}
