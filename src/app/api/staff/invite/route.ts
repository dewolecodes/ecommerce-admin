import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/src/lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('staff').select('email').eq('invite_token', token).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ email: data.email });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
