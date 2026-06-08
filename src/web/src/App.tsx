import { useState } from 'react'
import { useAuth } from './auth/auth-context'
import { supabase } from './auth/supabase-client'
import LoginPage from './pages/login-page'
import CabinListPage from './pages/cabin-list-page'
import CabinFormPage from './pages/cabin-form-page'
import type { Cabin } from './types/cabin'

type Page = 'list' | 'create' | 'edit'

export default function App() {
  const { loading, user } = useAuth()
  const [page, setPage] = useState<Page>('list')
  const [editingCabin, setEditingCabin] = useState<Cabin | null>(null)
  // listKey forces CabinListPage to re-fetch after create/edit/delete
  const [listKey, setListKey] = useState(0)

  if (loading) return <p style={{ padding: 24 }}>Loading…</p>
  if (!user) return <LoginPage />

  function handleSaved() {
    setListKey(k => k + 1)
    setPage('list')
    setEditingCabin(null)
  }

  function handleEdit(cabin: Cabin) {
    setEditingCabin(cabin)
    setPage('edit')
  }

  return (
    <>
      <header style={{ padding: '12px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700 }}>CabinConnect</span>
        <span style={{ fontSize: 14, color: '#555' }}>
          {user.email}&nbsp;
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ fontSize: 13, padding: '4px 10px', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}
          >
            Sign out
          </button>
        </span>
      </header>

      <main>
        {page === 'list' && (
          <CabinListPage
            key={listKey}
            onCreateNew={() => setPage('create')}
            onEdit={handleEdit}
          />
        )}
        {page === 'create' && (
          <CabinFormPage
            onSaved={handleSaved}
            onCancel={() => setPage('list')}
          />
        )}
        {page === 'edit' && editingCabin && (
          <CabinFormPage
            cabin={editingCabin}
            onSaved={handleSaved}
            onCancel={() => setPage('list')}
          />
        )}
      </main>
    </>
  )
}

