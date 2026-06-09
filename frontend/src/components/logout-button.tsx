import { useState } from 'react'
import { supabase } from '../lib/supabase'

const LOGOUT_ERROR = 'Logout failed. Please try again.'

export function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = async () => {
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setError(LOGOUT_ERROR)
        setLoading(false)
      }
      // Success: Auth Context fires SIGNED_OUT → session null → Protected Route Guard redirects to /login
    } catch {
      setError(LOGOUT_ERROR)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Logging out…' : 'Log out'}
      </button>
      {error && (
        <p role="alert" className="font-body-sm text-body-sm text-error mt-xs">
          {error}
        </p>
      )}
    </div>
  )
}
