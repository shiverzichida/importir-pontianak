import { NextResponse } from 'next/server';
import { getActiveCustomerProfile, toCustomerSessionUser } from '@/lib/customer-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const profile = await getActiveCustomerProfile();
  if (!profile) {
    return NextResponse.json(
      { authenticated: false, customer: null, profile: null },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      customer: toCustomerSessionUser(profile),
      profile,
    },
    { status: 200 }
  );
}
