import { NextRequest, NextResponse } from 'next/server';
import {
  createCustomerSessionToken,
  setCustomerSessionCookie,
} from '@/lib/auth';
import {
  CUSTOMER_SAFE_COLUMNS,
  getActiveCustomerProfile,
  toCustomerSessionUser,
} from '@/lib/customer-data';
import { normalizeWaPhone } from '@/lib/format';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { CustomerProfile } from '@/lib/types';

export async function PATCH(req: NextRequest) {
  const profile = await getActiveCustomerProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const fullName = String(body.full_name ?? profile.full_name).trim();
    const whatsapp = normalizeWaPhone(
      String(body.whatsapp ?? profile.whatsapp).trim()
    );
    const companyName =
      body.company_name !== undefined
        ? String(body.company_name || '').trim() || null
        : profile.company_name;
    const defaultDestinationCity = String(
      body.default_destination_city ?? profile.default_destination_city
    ).trim();
    const addressDetail =
      body.address_detail !== undefined
        ? String(body.address_detail || '').trim() || null
        : profile.address_detail;

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { error: 'Nama lengkap minimal 2 karakter.' },
        { status: 400 }
      );
    }
    if (!whatsapp || whatsapp.length < 9) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp tidak valid.' },
        { status: 400 }
      );
    }
    if (!defaultDestinationCity) {
      return NextResponse.json(
        { error: 'Kota tujuan default wajib dipilih.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('imp_customers')
      .update({
        full_name: fullName,
        whatsapp,
        company_name: companyName,
        default_destination_city: defaultDestinationCity,
        address_detail: addressDetail,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)
      .select(CUSTOMER_SAFE_COLUMNS)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Gagal memperbarui profil.' },
        { status: 500 }
      );
    }

    const updatedProfile = data as CustomerProfile;
    const sessionUser = toCustomerSessionUser(updatedProfile);
    const token = createCustomerSessionToken(sessionUser);
    const res = NextResponse.json(
      { customer: sessionUser, profile: updatedProfile },
      { status: 200 }
    );
    setCustomerSessionCookie(res, token);
    return res;
  } catch (err) {
    console.error('Customer profile PATCH error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyimpan profil.' },
      { status: 500 }
    );
  }
}
