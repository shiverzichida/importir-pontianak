import { NextRequest, NextResponse } from 'next/server';
import {
  createSessionToken,
  setAdminSessionCookie,
  verifyPassword,
} from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: user, error } = await supabase
      .from('imp_admin_users')
      .select('id, email, name, password_hash, role')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    const valid = verifyPassword(password, user.password_hash as string);
    if (!valid) {
      return NextResponse.json(
        { error: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    const sessionUser = {
      userId: user.id as string,
      email: user.email as string,
      name: user.name as string,
      role: user.role as string,
    };

    const token = createSessionToken(sessionUser);
    const res = NextResponse.json({ user: sessionUser }, { status: 200 });
    setAdminSessionCookie(res, token);
    return res;
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json(
      { error: 'Gagal memproses login admin.' },
      { status: 500 }
    );
  }
}
