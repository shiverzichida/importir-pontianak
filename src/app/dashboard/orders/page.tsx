import { redirect } from 'next/navigation';
import MemberOrdersClient from '@/components/dashboard/MemberOrdersClient';
import { getActiveCustomerProfile } from '@/lib/customer-data';
import { getPublicConfig } from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export default async function MemberOrdersPage() {
  const profile = await getActiveCustomerProfile();
  if (!profile) {
    redirect('/login?next=/dashboard/orders');
  }

  const config = await getPublicConfig();

  return (
    <MemberOrdersClient
      profile={profile}
      whatsappAdmin={config.settings.whatsapp_admin}
    />
  );
}
