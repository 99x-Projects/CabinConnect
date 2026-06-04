import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

export function AppLayout() {
  const { user, signOut } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        padding: '1rem 2rem',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff'
      }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#1a365d', fontWeight: 'bold', fontSize: '1.25rem' }}>
          CabinConnect
        </Link>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none', color: '#4a5568' }}>Dashboard</Link>
          <Link to="/cabins/new" style={{ textDecoration: 'none', color: '#4a5568' }}>Add Cabin</Link>
          <span style={{ color: '#718096', fontSize: '0.875rem' }}>{user?.email}</span>
          <button
            onClick={signOut}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </nav>
      </header>
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
    </div>
  );
}
