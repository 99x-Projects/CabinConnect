import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { RegisterCabinForm } from './components/cabins/register-cabin-form';
import { CabinList } from './components/cabins/cabin-list';
import { CabinDetail } from './components/cabins/cabin-detail';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [registeredCabinId, setRegisteredCabinId] = useState<string | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [selectedCabinId, setSelectedCabinId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    // session update driven by onAuthStateChange above — no imperative navigate()
  }

  if (!session) {
    return (
      <main style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'sans-serif' }}>
        <h1>CabinConnect</h1>
        <form onSubmit={handleSignIn}>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="email">Email</label><br />
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="password">Password</label><br />
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          {authError && <p role="alert" style={{ color: 'red' }}>{authError}</p>}
          <button type="submit">Sign in</button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>CabinConnect</h1>
      <p>Signed in as <strong>{session.user.email}</strong></p>
      <button onClick={() => supabase.auth.signOut()}>Sign out</button>
      <hr />
      <h2>My cabins</h2>
      {selectedCabinId ? (
        <CabinDetail
          cabinId={selectedCabinId}
          token={session.access_token}
          onBack={() => setSelectedCabinId(null)}
        />
      ) : (
        <CabinList
          token={session.access_token}
          refreshKey={listRefreshKey}
          onSelectCabin={setSelectedCabinId}
        />
      )}

      <hr />

      <h2>Register a cabin</h2>
      {registeredCabinId ? (
        <p>
          Cabin registered! ID: <code>{registeredCabinId}</code>
          {' '}
          <button onClick={() => { setRegisteredCabinId(null); setListRefreshKey(k => k + 1); }}>
            Register another
          </button>
        </p>
      ) : (
        <RegisterCabinForm
          token={session.access_token}
          onSuccess={id => { setRegisteredCabinId(id); setListRefreshKey(k => k + 1); }}
        />
      )}
    </main>
  );
}
