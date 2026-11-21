import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { syncFxRatesToDb } from '@/lib/fx-sync';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncFxRatesToDb({ force: true });
    const supabase = getSupabaseAdmin();
    const { data: settings } = await supabase
      .from('imp_settings')
      .select('*')
      .order('key', { ascending: true });

    return NextResponse.json({
      ok: true,
      ...result,
      settings: settings ?? [],
    });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Gagal menyinkronkan kurs pasar dari API.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
