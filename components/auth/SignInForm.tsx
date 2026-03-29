'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthButton } from './GoogleOAuthButton';
import { useAuth } from './AuthContext';

export function SignInForm() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Sign in failed');
      }

      await refreshAuth();
      router.push('/vote');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="loginForm" onSubmit={handleSubmit}>
      {error && (
        <div className="auth-error-box">
          <p>{error}</p>
        </div>
      )}

      <div className="auth-input-group">
        <label htmlFor="email">Email</label>
        <input
          id="email-address"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="auth-input-field"
          placeholder="name@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={loading}
        />
      </div>

      <div className="auth-input-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="auth-input-field"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          disabled={loading}
        />
      </div>

      <div className="auth-form-utils">
        <a href="#" className="auth-text-link">Forgot password?</a>
      </div>

      <div className="auth-button-group">
        <button type="submit" className="auth-btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
        <div className="auth-btn-google">
          <GoogleOAuthButton mode="signin" iconOnly={true} />
        </div>
      </div>
    </form>
  );
}
