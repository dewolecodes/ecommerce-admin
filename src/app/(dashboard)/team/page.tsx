import React from 'react';
import listStaff from '@/src/actions/staff/listStaff.server';
import inviteStaff from '@/src/actions/staff/inviteStaff.server';

export default async function TeamPage() {
  const staff = await listStaff(100, 0);

  async function handleInvite(formData: FormData) {
    'use server';
    const email = formData.get('email')?.toString();
    const role = formData.get('role')?.toString() || 'manager';
    const merchant_id = formData.get('merchant_id')?.toString() || '';
    if (!email) throw new Error('Email required');
    // inviteStaff will create the staff row and send the invite email
    await inviteStaff({ merchant_id, email, role });
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Team</h1>

      <section className="mb-6">
        <h2 className="font-semibold">Invite staff</h2>
        <p className="text-sm text-muted-foreground mb-2">Enter the staff email and role. Provide your merchant id (backend should derive this in production).</p>
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
          <div>
            <label className="block text-sm">Merchant ID</label>
            <input name="merchant_id" type="text" placeholder="merchant-id (for demo only)" className="border rounded px-2 py-1 w-80" />
          </div>
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
