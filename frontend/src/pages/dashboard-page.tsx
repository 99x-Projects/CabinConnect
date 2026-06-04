import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyCabins, type CabinResponse } from '../lib/api';

export function DashboardPage() {
  const [cabins, setCabins] = useState<CabinResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCabins() {
      try {
        const data = await getMyCabins();
        setCabins(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cabins');
      } finally {
        setLoading(false);
      }
    }
    fetchCabins();
  }, []);

  if (loading) {
    return <p>Loading your cabins...</p>;
  }

  if (error) {
    return (
      <div style={{ padding: '1rem', backgroundColor: '#fed7d7', color: '#c53030', borderRadius: '4px' }}>
        {error}
      </div>
    );
  }

  if (cabins.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2 style={{ color: '#2d3748', marginBottom: '1rem' }}>Welcome to CabinConnect!</h2>
        <p style={{ color: '#718096', marginBottom: '2rem' }}>You haven't added any cabins yet. Get started by creating your first cabin profile.</p>
        <Link
          to="/cabins/new"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2b6cb0',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: 600
          }}
        >
          Create Your First Cabin
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#2d3748' }}>My Cabins</h2>
        <Link
          to="/cabins/new"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#2b6cb0',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: 600
          }}
        >
          + Add Cabin
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {cabins.map((cabin) => (
          <div
            key={cabin.id}
            style={{
              padding: '1.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: '#fff'
            }}
          >
            <h3 style={{ marginBottom: '0.5rem', color: '#2d3748' }}>{cabin.name}</h3>
            <p style={{ color: '#718096', marginBottom: '0.25rem' }}>📍 {cabin.location}</p>
            <p style={{ color: '#718096', marginBottom: '0.5rem' }}>👥 Capacity: {cabin.capacity}</p>
            {cabin.amenities.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {cabin.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#ebf8ff',
                      color: '#2b6cb0',
                      borderRadius: '4px',
                      fontSize: '0.75rem'
                    }}
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
