import { redirect } from 'next/navigation';
import LoginClient from '@/components/auth/LoginClient';
import { sanitizeNextPath } from '@/lib/auth';
import { getActiveCustomerProfile } from '@/lib/customer-data';
import { getPublicConfig } from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params.next, '/dashboard');
  const existing = await getActiveCustomerProfile();
  if (existing) {
    redirect(nextPath);
  }

  const config = await getPublicConfig();
  return <LoginClient config={config} nextPath={nextPath} />;
}
