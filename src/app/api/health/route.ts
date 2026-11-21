import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('imp_settings').select('key').limit(1);

    if (error) {
      return NextResponse.json(
        { ok: false, db: 'error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      db: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { ok: false, db: 'error', message },
      { status: 500 }
    );
  }
}
