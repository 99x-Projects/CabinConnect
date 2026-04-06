'use client';
import { useState, useTransition } from 'react';
import { changeUserRole } from './actions';

export default function UserRoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [role, setRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleChange(newRole: string) {
    setRole(newRole);
    setSaved(false);
    startTransition(async () => {
      await changeUserRole(userId, newRole as 'user' | 'supplier' | 'admin');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <select
        value={role}
        onChange={e => handleChange(e.target.value)}
        disabled={isPending}
        style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, background: '#fff' }}
      >
        <option value="user">User</option>
        <option value="supplier">Supplier</option>
        <option value="admin">Admin</option>
      </select>
      {isPending && <span style={{ fontSize: 12, color: '#94a3b8' }}>Saving…</span>}
      {saved && <span style={{ fontSize: 12, color: '#22c55e' }}>✓ Saved</span>}
    </div>
  );
}
