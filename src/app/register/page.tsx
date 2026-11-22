import { redirect } from 'next/navigation';
import RegisterClient from '@/components/auth/RegisterClient';
import { sanitizeNextPath } from '@/lib/auth';
import { getActiveCustomerProfile } from '@/lib/customer-data';
import { getPublicConfig } from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export default async function RegisterPage({
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
  return <RegisterClient config={config} nextPath={nextPath} />;
}
