export const dynamic = 'force-dynamic';

import { getDashboardStats, getSuppliers, getEvents } from '../lib/api';

export default async function DashboardPage() {
  const [stats, pendingSuppliers, recentEvents] = await Promise.all([
    getDashboardStats(),
    getSuppliers('pending'),
    getEvents(),
  ]);

  const upcomingEvents = recentEvents
    .filter((e: any) => e.status === 'published' && new Date(e.start_date) > new Date())
    .slice(0, 5);

  return (
    <>
      <div className="topbar">
        <h1>Dashboard</h1>
        <span style={{ color: '#64748b', fontSize: 13 }}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      <div className="content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card orange">
            <div className="stat-value">{stats.pendingSuppliers}</div>
            <div className="stat-label">Pending supplier nominations</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-value">{stats.upcomingEvents}</div>
            <div className="stat-label">Upcoming events</div>
          </div>
          <div className="stat-card green">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Registered users</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-value">{stats.pendingBorrows}</div>
            <div className="stat-label">Pending borrow requests</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Pending suppliers */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Pending Supplier Nominations</span>
              <a href="/suppliers" style={{ fontSize: 13, color: '#3b82f6' }}>View all →</a>
            </div>
            {pendingSuppliers.length === 0
              ? <div className="empty-state"><p>No pending nominations</p></div>
              : (
                <table className="table">
                  <thead><tr><th>Name</th><th>Categories</th><th>Nominated by</th></tr></thead>
                  <tbody>
                    {pendingSuppliers.slice(0, 5).map((s: any) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td><span style={{ color: '#64748b' }}>{s.categories?.join(', ')}</span></td>
                        <td style={{ color: '#64748b' }}>{s.profiles?.display_name ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </div>

          {/* Upcoming events */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Upcoming Events</span>
              <a href="/events" style={{ fontSize: 13, color: '#3b82f6' }}>View all →</a>
            </div>
            {upcomingEvents.length === 0
              ? <div className="empty-state"><p>No upcoming events</p></div>
              : (
                <table className="table">
                  <thead><tr><th>Event</th><th>Date</th><th>Attendees</th></tr></thead>
                  <tbody>
                    {upcomingEvents.map((e: any) => (
                      <tr key={e.id}>
                        <td style={{ fontWeight: 600 }}>{e.title}</td>
                        <td style={{ color: '#64748b' }}>{new Date(e.start_date).toLocaleDateString()}</td>
                        <td>{e.attendee_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </div>
        </div>
      </div>
    </>
  );
}
