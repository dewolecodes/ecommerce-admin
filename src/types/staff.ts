export type Staff = {
  id: string;
  email: string;
  full_name?: string | null;
  role?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  metadata?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
};
