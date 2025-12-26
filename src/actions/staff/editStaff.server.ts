import { getSupabaseServerClient } from '@/src/lib/supabaseServer';
import type { Staff } from '@/src/types/staff';

export default async function editStaff(id: string, updates: Partial<Omit<Staff, 'id'>>): Promise<Staff> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('staff').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Staff;
}
