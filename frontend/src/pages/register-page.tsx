import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpError) {
        // Generic error — do not reveal if email exists (security: no user enumeration)
        setError('Registration failed. Please try again.');
        return;
      }

      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem', color: '#1a365d' }}>Create Account</h1>

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#fed7d7', color: '#c53030', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
          />
          {fieldErrors.email && <span style={{ color: '#c53030', fontSize: '0.875rem' }}>{fieldErrors.email}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
          />
          {fieldErrors.password && <span style={{ color: '#c53030', fontSize: '0.875rem' }}>{fieldErrors.password}</span>}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
          />
          {fieldErrors.confirmPassword && <span style={{ color: '#c53030', fontSize: '0.875rem' }}>{fieldErrors.confirmPassword}</span>}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#2b6cb0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600
          }}
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Already have an account? <Link to="/login" style={{ color: '#2b6cb0' }}>Log in</Link>
      </p>
    </div>
  );
}
