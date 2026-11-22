import { redirect } from 'next/navigation';
import MemberProfileClient from '@/components/dashboard/MemberProfileClient';
import { getActiveCustomerProfile } from '@/lib/customer-data';
import { getPublicConfig } from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export default async function MemberProfilePage() {
  const profile = await getActiveCustomerProfile();
  if (!profile) {
    redirect('/login?next=/dashboard/profile');
  }

  const config = await getPublicConfig();

  return (
    <MemberProfileClient profile={profile} destinations={config.destinations} />
  );
}
