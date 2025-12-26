import { getSupabaseServerClient } from '@/src/lib/supabaseServer';
import type { Staff } from '@/src/types/staff';

export default async function listStaff(limit = 100, offset = 0, merchant_id?: string): Promise<Staff[]> {
  const supabase = getSupabaseServerClient();
  let query = supabase.from('staff').select('*').range(offset, offset + limit - 1);
  if (merchant_id) {
    query = query.eq('merchant_id', merchant_id);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as Staff[];
}
