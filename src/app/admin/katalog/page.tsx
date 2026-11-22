import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import CatalogManager from '@/components/admin/CatalogManager';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminKatalogPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <AdminShell user={session}>
      <CatalogManager />
    </AdminShell>
  );
}
