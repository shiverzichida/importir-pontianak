import { NextResponse } from 'next/server';
import { getPublicLclBatches } from '@/lib/public-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const batches = await getPublicLclBatches();
  return NextResponse.json({ batches });
}
