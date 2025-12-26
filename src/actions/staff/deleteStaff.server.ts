import { getSupabaseServerClient } from '@/src/lib/supabaseServer';

export default async function deleteStaff(id: string): Promise<{ id: string }[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('staff').delete().eq('id', id).select('id');
  if (error) throw error;
  return data as { id: string }[];
}
