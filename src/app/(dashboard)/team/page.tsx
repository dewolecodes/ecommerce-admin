import React from 'react';
import listStaff from '@/src/actions/staff/listStaff.server';
import inviteStaff from '@/src/actions/staff/inviteStaff.server';
import { createServerActionClient } from '@/src/lib/supabase/server-action';

export default async function TeamPage() {
  // derive current user and merchant_id from session
  const supabase = createServerActionClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  let merchant_id: string | null = null;

  if (user) {
    const { data: staffRow, error } = await supabase.from('staff').select('merchant_id, role').eq('auth_user_id', user.id).limit(1).single();
    if (!error && staffRow) {
      merchant_id = staffRow.merchant_id;
    }
  }

  if (!merchant_id) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Team</h1>
        <p className="text-red-600">No merchant associated with your account. Ensure you are signed in as a merchant owner or admin.</p>
      </div>
    );
  }

  const staff = await listStaff(100, 0, merchant_id);

  async function handleInvite(formData: FormData) {
    'use server';
    const email = formData.get('email')?.toString();
    const role = formData.get('role')?.toString() || 'manager';
    if (!email) throw new Error('Email required');
    // merchant_id derived from session
    await inviteStaff({ merchant_id: merchant_id as string, email, role });
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Team</h1>

      <section className="mb-6">
        <h2 className="font-semibold">Invite staff</h2>
        <p className="text-sm text-muted-foreground mb-2">Enter the staff email and role. Merchant is derived from your session.</p>
        <form action={handleInvite} className="space-y-2">
          <div>
            <label className="block text-sm">Email</label>
            <input name="email" type="email" required className="border rounded px-2 py-1 w-80" />
          </div>
          <div>
            <label className="block text-sm">Role</label>
            <select name="role" className="border rounded px-2 py-1">
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          {/* merchant_id removed - derived from session */}
          <div>
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Send invite</button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-semibold">Current staff</h2>
        <table className="w-full mt-2 table-auto">
          <thead>
            <tr>
              <th className="text-left">Email</th>
              <th className="text-left">Role</th>
              <th className="text-left">Merchant</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s: any) => (
              <tr key={s.id}>
                <td className="py-2">{s.email}</td>
                <td>{s.role}</td>
                <td>{s.merchant_id}</td>
                <td>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
