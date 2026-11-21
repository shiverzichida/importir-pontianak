import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, hashPassword, verifyPassword } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };
    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');

    if (!currentPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password baru minimal 8 karakter.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: user, error } = await supabase
      .from('imp_admin_users')
      .select('id, password_hash')
      .eq('id', session.userId)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Akun admin tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (!verifyPassword(currentPassword, user.password_hash as string)) {
      return NextResponse.json(
        { error: 'Password saat ini tidak sesuai.' },
        { status: 400 }
      );
    }

    const newHash = hashPassword(newPassword);
    const { error: updateErr } = await supabase
      .from('imp_admin_users')
      .update({ password_hash: newHash })
      .eq('id', session.userId);

    if (updateErr) {
      return NextResponse.json(
        { error: 'Gagal memperbarui password.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Password change error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
