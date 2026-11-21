import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import ShipmentManager from '@/components/admin/ShipmentManager';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminShipmentsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <AdminShell user={session}>
      <ShipmentManager />
    </AdminShell>
  );
}
