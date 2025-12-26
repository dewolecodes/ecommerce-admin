"use client";
import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AcceptInvitePage() {
  const search = useSearchParams();
  const token = search.get('token') || '';
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    // fetch invite details (email) from server
    fetch(`/api/staff/invite?token=${token}`)
      .then((r) => r.json())
      .then((d) => setEmail(d.email))
      .catch(() => setMessage('Invalid or expired invite token'));
  }, [token]);

  useEffect(() => {
    // listen for sign-in and, if signed in, associate account with invite
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const authUserId = session.user.id;
        // call accept endpoint
        fetch('/api/staff/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, authUserId }),
        })
          .then((r) => r.json())
          .then(() => {
            setMessage('Invite accepted — redirecting to dashboard...');
            setTimeout(() => router.push('/'), 1200);
          })
          .catch((e) => setMessage('Could not accept invite: ' + String(e)));
      }
    });
    return () => { sub?.subscription.unsubscribe(); };
  }, [supabase, token, router]);

  async function sendMagicLink() {
    if (!email) return setMessage('No email available for this invite');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMessage('Error sending magic link: ' + error.message);
    else setMessage('Magic link sent. Check your email and click the link to sign in.');
    setLoading(false);
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Accept invite</h1>
      {!token && <p>Missing invite token.</p>}
      {token && (
        <div>
          <p>Invite token: <code>{token}</code></p>
          <p className="mt-2">Invite email: <strong>{email ?? 'loading...'}</strong></p>
          <div className="mt-4">
            <button onClick={sendMagicLink} disabled={loading} className="bg-blue-600 text-white px-3 py-1 rounded">
              Send magic link to sign in
            </button>
          </div>
          {message && <p className="mt-3">{message}</p>}
        </div>
      )}
    </div>
  );
}
