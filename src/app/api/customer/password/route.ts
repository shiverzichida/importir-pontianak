import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { getActiveCustomerProfile } from '@/lib/customer-data';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const profile = await getActiveCustomerProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      current_password?: string;
      new_password?: string;
    };
    const currentPassword = String(body.current_password || '');
    const newPassword = String(body.new_password || '');

    if (!currentPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password baru minimal 6 karakter.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: user, error } = await supabase
      .from('imp_customers')
      .select('id, password_hash')
      .eq('id', profile.id)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Akun member tidak ditemukan.' },
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
      .from('imp_customers')
      .update({
        password_hash: newHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (updateErr) {
      return NextResponse.json(
        { error: 'Gagal memperbarui password.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Customer password POST error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengubah password.' },
      { status: 500 }
    );
  }
}
