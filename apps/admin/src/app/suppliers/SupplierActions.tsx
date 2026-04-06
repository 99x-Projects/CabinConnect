'use client';
import { useState, useTransition } from 'react';
import { approveSupplier, rejectSupplier } from './actions';

export default function SupplierActions({ supplierId }: { supplierId: string }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null);

  if (done) {
    return (
      <span className={`badge badge-${done}`}>
        {done === 'approved' ? '✓ Approved' : '✗ Rejected'}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        className="btn btn-success btn-sm"
        disabled={isPending}
        onClick={() => startTransition(async () => {
          await approveSupplier(supplierId);
          setDone('approved');
        })}
      >
        Approve
      </button>
      <button
        className="btn btn-danger btn-sm"
        disabled={isPending}
        onClick={() => startTransition(async () => {
          await rejectSupplier(supplierId);
          setDone('rejected');
        })}
      >
        Reject
      </button>
    </div>
  );
}
