import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await req.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.is_active !== undefined) {
      updates.is_active = Boolean(body.is_active);
    }

    if (body.admin_notes !== undefined) {
      updates.admin_notes = String(body.admin_notes || '').trim() || null;
    }

    if (body.marking_code_base !== undefined) {
      const cleaned = String(body.marking_code_base || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      if (cleaned.length < 3 || cleaned.length > 16) {
        return NextResponse.json(
          {
            error:
              'Kode dasar marking harus 3-16 karakter huruf/angka tanpa spasi.',
          },
          { status: 400 }
        );
      }
      updates.marking_code_base = cleaned;
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('imp_customers')
      .update(updates)
      .eq('id', id)
      .select(
        'id, member_code, marking_code_base, email, full_name, whatsapp, company_name, default_destination_city, address_detail, is_active, admin_notes, last_login_at, created_at, updated_at'
      )
      .single();

    if (error || !data) {
      if (error?.code === '23505') {
        return NextResponse.json(
          { error: 'Kode dasar marking tersebut sudah dipakai member lain.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error?.message || 'Member tidak ditemukan.' },
        { status: error ? 500 : 404 }
      );
    }

    return NextResponse.json({ customer: data });
  } catch (err) {
    console.error('Admin customer PATCH error:', err);
    return NextResponse.json(
      { error: 'Gagal memperbarui data member.' },
      { status: 500 }
    );
  }
}
