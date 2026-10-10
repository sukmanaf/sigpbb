import { NextRequest, NextResponse } from 'next/server';
import { getDesaStats } from '@/lib/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const stats = await getDesaStats(id);
    if (!stats) {
      return NextResponse.json({ error: 'Desa not found' }, { status: 404 });
    }
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
