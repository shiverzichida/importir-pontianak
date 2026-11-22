import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import LclBatchManager from '@/components/admin/LclBatchManager';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminKloterPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <AdminShell user={session}>
      <LclBatchManager />
    </AdminShell>
  );
}
