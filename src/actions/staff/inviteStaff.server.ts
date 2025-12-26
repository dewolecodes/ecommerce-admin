import { getSupabaseServerClient } from '@/src/lib/supabaseServer';
import { sendEmail } from '@/src/lib/email';

import crypto from 'crypto';

type InviteParams = {
  merchant_id: string; // tenant id
  email: string;
  role?: string;
  invitedBy?: string; // optional admin id who invited
  acceptUrl?: string; // optional URL prefix for invite links (defaults to NEXT_PUBLIC_ADMIN_URL)
};

export default async function inviteStaff(params: InviteParams) {
  const { merchant_id, email, role = 'manager', invitedBy, acceptUrl } = params;
  if (!merchant_id) throw new Error('merchant_id is required');
  const supabase = getSupabaseServerClient();

  const token = crypto.randomBytes(24).toString('hex');
  const invited_at = new Date().toISOString();

  const insert = {
    email,
    full_name: null,
    role,
    phone: null,
    avatar_url: null,
    metadata: {},
    merchant_id,
    status: 'invited',
    invited_at,
    invite_token: token,
  };

  const { data, error } = await supabase.from('staff').insert([insert]).select().single();
  if (error) throw error;

  // Build accept URL
  const base = acceptUrl || process.env.NEXT_PUBLIC_ADMIN_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const acceptLink = `${base.replace(/\/$/, '')}/staff/accept-invite?token=${token}`;

  const subject = `You were invited to join a merchant on the admin dashboard`;
  const html = `<p>Hello,</p>
  <p>You were invited to join a merchant dashboard. Click the link below to accept the invite and set up your account:</p>
  <p><a href="${acceptLink}">Accept invite</a></p>
  <p>If you did not expect this, ignore this email.</p>`;

  await sendEmail({ to: email, subject, html });

  return data;
}
