import { useAuth } from './auth/auth-context'

export default function App() {
  const { loading, user } = useAuth()

  if (loading) return <p>Loading…</p>

  return (
    <main>
      {user ? (
        <p>Signed in as {user.email}</p>
      ) : (
        <p>Not signed in.</p>
      )}
    </main>
  )
}
