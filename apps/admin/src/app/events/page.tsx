export const dynamic = 'force-dynamic';

import { getEvents } from '../../lib/api';
import EventActions from './EventActions';

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const events = await getEvents(status);

  return (
    <>
      <div className="topbar">
        <h1>Events</h1>
      </div>
      <div className="content">
        <div className="tabs">
          {[
            { value: '', label: 'All' },
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' },
            { value: 'cancelled', label: 'Cancelled' },
          ].map(tab => (
            <a key={tab.value} href={`/events${tab.value ? `?status=${tab.value}` : ''}`}
              className={`tab ${(status ?? '') === tab.value ? 'active' : ''}`}>
              {tab.label}
            </a>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Events ({events.length})</span>
          </div>
          {events.length === 0
            ? <div className="empty-state"><p>No events found</p></div>
            : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Organiser</th>
                    <th>Category</th>
                    <th>Start Date</th>
                    <th>Resort</th>
                    <th>Attendees</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e: any) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600, maxWidth: 200 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{e.location}</div>
                      </td>
                      <td style={{ color: '#64748b' }}>{e.profiles?.display_name ?? '—'}</td>
                      <td>
                        <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 10, fontSize: 12 }}>{e.category}</span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: 13 }}>
                        {new Date(e.start_date).toLocaleDateString()}<br />
                        <span style={{ fontSize: 11 }}>{new Date(e.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td style={{ color: '#64748b' }}>{e.resort ?? '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 700 }}>{e.attendee_count}</span>
                        {e.max_attendees && <span style={{ color: '#94a3b8', fontSize: 12 }}> /{e.max_attendees}</span>}
                      </td>
                      <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                      <td><EventActions eventId={e.id} currentStatus={e.status} /></td>
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
