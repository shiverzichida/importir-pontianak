import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import CustomersManager from '@/components/admin/CustomersManager';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <AdminShell user={session}>
      <CustomersManager />
    </AdminShell>
  );
}
