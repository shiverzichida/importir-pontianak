import { NextRequest, NextResponse } from 'next/server';
import { getActiveCustomerProfile } from '@/lib/customer-data';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const profile = await getActiveCustomerProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await req.json()) as {
      payment_proof_url?: string;
      payment_proof_note?: string;
    };

    const proofUrl = String(body.payment_proof_url || '').trim();
    const proofNote = String(body.payment_proof_note || '').trim() || null;

    if (!proofUrl || !proofUrl.startsWith('/api/uploads/')) {
      return NextResponse.json(
        { error: 'File bukti pembayaran tidak valid.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: existing, error: findErr } = await supabase
      .from('imp_shipments')
      .select('id, customer_id')
      .eq('id', id)
      .eq('customer_id', profile.id)
      .maybeSingle();

    if (findErr || !existing) {
      return NextResponse.json(
        { error: 'Pengiriman tidak ditemukan.' },
        { status: 404 }
      );
    }

    const nowIso = new Date().toISOString();
    const { data: updated, error: updateErr } = await supabase
      .from('imp_shipments')
      .update({
        payment_proof_url: proofUrl,
        payment_proof_note: proofNote,
        payment_proof_uploaded_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', id)
      .eq('customer_id', profile.id)
      .select('*')
      .single();

    if (updateErr || !updated) {
      return NextResponse.json(
        { error: updateErr?.message || 'Gagal menyimpan bukti pembayaran.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ shipment: updated });
  } catch (err) {
    console.error('Customer payment proof POST error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengunggah bukti pembayaran.' },
      { status: 500 }
    );
  }
}
