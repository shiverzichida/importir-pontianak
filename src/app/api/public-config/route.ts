import { NextResponse } from 'next/server';
import { getPublicConfig } from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = await getPublicConfig();
  return NextResponse.json(config);
}
