import { redirect } from 'next/navigation';
import MemberWarehousesClient from '@/components/dashboard/MemberWarehousesClient';
import { getActiveCustomerProfile } from '@/lib/customer-data';
import { getPublicConfig } from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export default async function MemberWarehousesPage() {
  const profile = await getActiveCustomerProfile();
  if (!profile) {
    redirect('/login?next=/dashboard/warehouses');
  }

  const config = await getPublicConfig();

  return (
    <MemberWarehousesClient profile={profile} warehouses={config.warehouses} />
  );
}
