import { redirect } from 'next/navigation';
import MemberShipmentsClient from '@/components/dashboard/MemberShipmentsClient';
import { getActiveCustomerProfile } from '@/lib/customer-data';

export const dynamic = 'force-dynamic';

export default async function MemberShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const profile = await getActiveCustomerProfile();
  if (!profile) {
    redirect('/login?next=/dashboard/shipments');
  }

  return (
    <MemberShipmentsClient
      profile={profile}
      initialQuery={(params.q || '').trim()}
    />
  );
}
