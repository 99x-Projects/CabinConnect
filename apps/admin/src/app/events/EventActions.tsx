'use client';
import { useState, useTransition } from 'react';
import { publishEvent, cancelEvent } from './actions';

export default function EventActions({ eventId, currentStatus }: { eventId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);

  if (status === 'cancelled') return <span style={{ color: '#94a3b8', fontSize: 12 }}>Cancelled</span>;

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {status === 'draft' && (
        <button
          className="btn btn-primary btn-sm"
          disabled={isPending}
          onClick={() => startTransition(async () => {
            await publishEvent(eventId);
            setStatus('published');
          })}
        >
          Publish
        </button>
      )}
      {status !== 'cancelled' && (
        <button
          className="btn btn-ghost btn-sm"
          disabled={isPending}
          onClick={() => startTransition(async () => {
            await cancelEvent(eventId);
            setStatus('cancelled');
          })}
        >
          Cancel
        </button>
      )}
    </div>
  );
}
