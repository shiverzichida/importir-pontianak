import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import RfqManager from '@/components/admin/RfqManager';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminRfqPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <AdminShell user={session}>
      <RfqManager />
    </AdminShell>
  );
}
