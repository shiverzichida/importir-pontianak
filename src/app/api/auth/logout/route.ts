import { NextResponse } from 'next/server';
import { clearCustomerSessionCookie } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true }, { status: 200 });
  clearCustomerSessionCookie(res);
  return res;
}
