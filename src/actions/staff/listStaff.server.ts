import { getSupabaseServerClient } from '@/src/lib/supabaseServer';
import type { Staff } from '@/src/types/staff';

export default async function listStaff(limit = 100, offset = 0): Promise<Staff[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('staff').select('*').range(offset, offset + limit - 1);
  if (error) throw error;
  return data as Staff[];
}
