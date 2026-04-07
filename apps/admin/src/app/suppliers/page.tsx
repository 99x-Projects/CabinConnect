export const dynamic = 'force-dynamic';

import { getSuppliers } from '../../lib/api';
import SupplierActions from './SupplierActions';

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = 'pending' } = await searchParams;
  const validStatus = ['pending', 'approved', 'rejected'].includes(status)
    ? (status as 'pending' | 'approved' | 'rejected')
    : 'pending';

  const suppliers = await getSuppliers(validStatus);

  return (
    <>
      <div className="topbar">
        <h1>Supplier Directory</h1>
      </div>
      <div className="content">
        {/* Tab filter */}
        <div className="tabs">
          {(['pending', 'approved', 'rejected'] as const).map(s => (
            <a key={s} href={`/suppliers?status=${s}`} className={`tab ${validStatus === s ? 'active' : ''}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </a>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">{validStatus.charAt(0).toUpperCase() + validStatus.slice(1)} Suppliers ({suppliers.length})</span>
          </div>
          {suppliers.length === 0
            ? <div className="empty-state"><p>No {validStatus} suppliers</p></div>
            : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Categories</th>
                    <th>Phone</th>
                    <th>Service Areas</th>
                    <th>Nominated By</th>
                    <th>Date</th>
                    {validStatus === 'pending' && <th>Actions</th>}
                    {validStatus === 'approved' && <th>Rating</th>}
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s: any) => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.name}</div>
                        {s.claimed_by && <div style={{ fontSize: 11, color: '#22c55e', marginTop: 2 }}>✓ Claimed</div>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {s.categories?.map((c: string) => (
                            <span key={c} style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{c}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ color: '#64748b' }}>{s.phone ?? '—'}</td>
                      <td style={{ color: '#64748b', fontSize: 12 }}>{s.service_areas?.join(', ') || '—'}</td>
                      <td style={{ color: '#64748b' }}>{s.profiles?.display_name ?? '—'}</td>
                      <td style={{ color: '#64748b', fontSize: 12 }}>{new Date(s.created_at).toLocaleDateString()}</td>
                      {validStatus === 'pending' && (
                        <td><SupplierActions supplierId={s.id} /></td>
                      )}
                      {validStatus === 'approved' && (
                        <td>
                          <span style={{ color: '#f59e0b', fontWeight: 700 }}>{'★'.repeat(Math.round(s.avg_rating ?? 0))}</span>
                          <span style={{ color: '#94a3b8', fontSize: 12 }}> ({s.review_count})</span>
                        </td>
                      )}
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
