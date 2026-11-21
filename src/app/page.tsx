import LandingClient from '@/components/public/LandingClient';
import { getPublicConfig } from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const config = await getPublicConfig();
  return <LandingClient config={config} />;
}
