import { NextResponse } from 'next/server';
import acceptInvite from '@/src/actions/staff/acceptInvite.server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, authUserId } = body;
    if (!token || !authUserId) return NextResponse.json({ error: 'token and authUserId required' }, { status: 400 });
    const data = await acceptInvite(token, authUserId);
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
