import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import TrackingWidget from '@/components/public/TrackingWidget';
import { getPublicConfig } from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export default async function TrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const config = await getPublicConfig();

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar settings={config.settings} isTrackingPage />
      <main id="main-content" className="flex-1">
        <TrackingWidget
          initialQuery={params.q || ''}
          settings={config.settings}
        />
      </main>
      <footer className="bg-navy-dark text-slate-300 border-t border-white/10 py-6 px-4 text-xs">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <span>
            {config.settings.company_name} · {config.settings.company_address}
          </span>
          <Link href="/" className="text-teal-300 font-semibold hover:underline">
            Kembali ke Beranda
          </Link>
        </div>
      </footer>
    </div>
  );
}
