import Navbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/PublicFooter';
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFD]">
      <Navbar settings={config.settings} isTrackingPage />
      <main id="main-content" className="flex-1">
        <TrackingWidget
          initialQuery={params.q || ''}
          settings={config.settings}
        />
      </main>
      <PublicFooter settings={config.settings} />
    </div>
  );
}
