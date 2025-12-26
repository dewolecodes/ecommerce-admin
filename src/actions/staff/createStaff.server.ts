import { getSupabaseServerClient } from '@/src/lib/supabaseServer';
import type { Staff } from '@/src/types/staff';

export default async function createStaff(payload: {
  email: string;
  full_name?: string;
  role?: string;
  phone?: string;
  avatar_url?: string;
  metadata?: Record<string, any>;
}): Promise<Staff> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('staff').insert([payload]).select().single();
  if (error) throw error;
  return data as Staff;
}
