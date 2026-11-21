import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import SettingsManager from '@/components/admin/SettingsManager';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <AdminShell user={session}>
      <SettingsManager />
    </AdminShell>
  );
}
