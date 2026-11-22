import { NextRequest, NextResponse } from 'next/server';
import {
  createCustomerSessionToken,
  hashPassword,
  setCustomerSessionCookie,
} from '@/lib/auth';
import { toCustomerSessionUser } from '@/lib/customer-data';
import { normalizeWaPhone } from '@/lib/format';
import {
  generateMarkingCodeBase,
  generateMemberCode,
} from '@/lib/server-codes';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { CustomerProfile } from '@/lib/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const fullName = String(body.full_name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const whatsapp = normalizeWaPhone(String(body.whatsapp || '').trim());
    const password = String(body.password || '');
    const hasConfirm = body.confirm_password !== undefined;
    const confirmPassword = String(body.confirm_password || '');
    const companyName = String(body.company_name || '').trim() || null;
    const defaultDestinationCity =
      String(body.default_destination_city || '').trim() ||
      'Pontianak (Ambil di Gudang)';

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { error: 'Nama lengkap wajib diisi minimal 2 karakter.' },
        { status: 400 }
      );
    }

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: 'Format alamat email tidak valid.' },
        { status: 400 }
      );
    }

    if (!whatsapp || whatsapp.length < 9) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp aktif wajib diisi dengan benar.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter.' },
        { status: 400 }
      );
    }

    if (hasConfirm && password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Konfirmasi password tidak cocok.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: existingEmail } = await supabase
      .from('imp_customers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email tersebut sudah terdaftar. Silakan login.' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const nowIso = new Date().toISOString();
    let insertedProfile: CustomerProfile | null = null;
    let lastErrorMessage = 'Gagal mendaftarkan akun member.';

    for (let attempt = 0; attempt < 5; attempt++) {
      const memberCode = generateMemberCode();
      const markingCodeBase = generateMarkingCodeBase(companyName || fullName);

      const { data, error } = await supabase
        .from('imp_customers')
        .insert({
          member_code: memberCode,
          marking_code_base: markingCodeBase,
          email,
          password_hash: passwordHash,
          full_name: fullName,
          whatsapp,
          company_name: companyName,
          default_destination_city: defaultDestinationCity,
          is_active: true,
          last_login_at: nowIso,
          updated_at: nowIso,
        })
        .select(
          'id, member_code, marking_code_base, email, full_name, whatsapp, company_name, default_destination_city, address_detail, is_active, last_login_at, created_at, updated_at'
        )
        .single();

      if (!error && data) {
        insertedProfile = data as CustomerProfile;
        break;
      }

      if (error?.code === '23505') {
        const msg = String(error.message || '').toLowerCase();
        if (msg.includes('email')) {
          return NextResponse.json(
            { error: 'Email tersebut sudah terdaftar. Silakan login.' },
            { status: 409 }
          );
        }
        // Retry with new generated member_code / marking_code_base
        lastErrorMessage = error.message;
        continue;
      }

      lastErrorMessage = error?.message || lastErrorMessage;
      break;
    }

    if (!insertedProfile) {
      return NextResponse.json({ error: lastErrorMessage }, { status: 500 });
    }

    // Best-effort auto-claim any prior unlinked RFQs or Shipments matching this WhatsApp
    await Promise.all([
      supabase
        .from('imp_rfq_orders')
        .update({ customer_id: insertedProfile.id })
        .is('customer_id', null)
        .eq('customer_whatsapp', whatsapp),
      supabase
        .from('imp_shipments')
        .update({ customer_id: insertedProfile.id })
        .is('customer_id', null)
        .eq('customer_whatsapp', whatsapp),
    ]);

    const sessionUser = toCustomerSessionUser(insertedProfile);
    const token = createCustomerSessionToken(sessionUser);
    const res = NextResponse.json(
      { customer: sessionUser, profile: insertedProfile },
      { status: 201 }
    );
    setCustomerSessionCookie(res, token);
    return res;
  } catch (err) {
    console.error('Customer register error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mendaftarkan akun.' },
      { status: 500 }
    );
  }
}
