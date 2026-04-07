export const dynamic = 'force-dynamic';

import { getUsers } from '../../lib/api';
import UserRoleSelect from './UserRoleSelect';

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <>
      <div className="topbar">
        <h1>Users</h1>
        <span style={{ color: '#64748b', fontSize: 13 }}>{users.length} registered users</span>
      </div>
      <div className="content">
        <div className="card">
          <div className="card-header">
            <span className="card-title">All Users</span>
          </div>
          {users.length === 0
            ? <div className="empty-state"><p>No users yet</p></div>
            : (
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Language</th>
                    <th>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{u.display_name || 'Unknown'}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2, fontFamily: 'monospace' }}>
                          {u.id.slice(0, 12)}…
                        </div>
                      </td>
                      <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                      <td style={{ color: '#64748b', fontSize: 13 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td style={{ color: '#64748b' }}>{u.locale?.toUpperCase() ?? 'NO'}</td>
                      <td><UserRoleSelect userId={u.id} currentRole={u.role} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      </div>
    </>
  );
}
