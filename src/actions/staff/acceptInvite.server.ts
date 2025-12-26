import { getSupabaseServerClient } from '@/src/lib/supabaseServer';

// Called after a staff user has signed in (or provided their auth uid).
// The frontend should call this with the invite token and the current auth uid
// to associate the auth user and activate the staff row.

export default async function acceptInvite(token: string, authUserId: string) {
  if (!token) throw new Error('invite token required');
  if (!authUserId) throw new Error('authUserId required');
  const supabase = getSupabaseServerClient();

  // find the invited staff row
  const { data: existing, error: fetchErr } = await supabase.from('staff').select('*').eq('invite_token', token).single();
  if (fetchErr) throw fetchErr;
  if (!existing) throw new Error('Invalid invite token');
  if (existing.status === 'active') return existing;

  const updates: any = {
    status: 'active',
    auth_user_id: authUserId,
    invite_token: null,
  };

  const { data, error } = await supabase.from('staff').update(updates).eq('id', existing.id).select().single();
  if (error) throw error;
  return data;
}
