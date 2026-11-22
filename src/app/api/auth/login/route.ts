import { NextRequest, NextResponse } from 'next/server';
import {
  createCustomerSessionToken,
  setCustomerSessionCookie,
  verifyPassword,
} from '@/lib/auth';
import { toCustomerSessionUser } from '@/lib/customer-data';
import { normalizeWaPhone } from '@/lib/format';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { CustomerProfile } from '@/lib/types';

interface CustomerAuthRow extends CustomerProfile {
  password_hash: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      identifier?: string;
      email?: string;
      password?: string;
    };
    const rawIdentifier = String(body.identifier || body.email || '').trim();
    const password = String(body.password || '');

    if (!rawIdentifier || !password) {
      return NextResponse.json(
        { error: 'Email / nomor WhatsApp dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    let matchedUser: CustomerAuthRow | null = null;

    if (rawIdentifier.includes('@')) {
      const { data } = await supabase
        .from('imp_customers')
        .select(
          'id, member_code, marking_code_base, email, password_hash, full_name, whatsapp, company_name, default_destination_city, address_detail, is_active, last_login_at, created_at, updated_at'
        )
        .eq('email', rawIdentifier.toLowerCase())
        .maybeSingle();

      if (data) {
        const candidate = data as CustomerAuthRow;
        if (verifyPassword(password, candidate.password_hash)) {
          matchedUser = candidate;
        }
      }
    } else {
      const wa = normalizeWaPhone(rawIdentifier);
      if (wa.length >= 6) {
        const { data } = await supabase
          .from('imp_customers')
          .select(
            'id, member_code, marking_code_base, email, password_hash, full_name, whatsapp, company_name, default_destination_city, address_detail, is_active, last_login_at, created_at, updated_at'
          )
          .eq('whatsapp', wa)
          .order('created_at', { ascending: false })
          .limit(5);

        for (const row of (data as CustomerAuthRow[] | null) ?? []) {
          if (verifyPassword(password, row.password_hash)) {
            matchedUser = row;
            break;
          }
        }
      }
    }

    if (!matchedUser) {
      return NextResponse.json(
        { error: 'Email / WhatsApp atau password salah.' },
        { status: 401 }
      );
    }

    if (!matchedUser.is_active) {
      return NextResponse.json(
        {
          error:
            'Akun Anda sedang dinonaktifkan oleh admin. Silakan hubungi WhatsApp Importir Pontianak.',
        },
        { status: 403 }
      );
    }

    const nowIso = new Date().toISOString();
    await supabase
      .from('imp_customers')
      .update({ last_login_at: nowIso, updated_at: nowIso })
      .eq('id', matchedUser.id);

    const { password_hash: _ignoredHash, ...safeProfile } = matchedUser;
    void _ignoredHash;
    safeProfile.last_login_at = nowIso;

    const sessionUser = toCustomerSessionUser(safeProfile);
    const token = createCustomerSessionToken(sessionUser);
    const res = NextResponse.json({ customer: sessionUser }, { status: 200 });
    setCustomerSessionCookie(res, token);
    return res;
  } catch (err) {
    console.error('Customer login error:', err);
    return NextResponse.json(
      { error: 'Gagal memproses login member.' },
      { status: 500 }
    );
  }
}
