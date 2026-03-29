'use client';

import { useState } from 'react';
import { GoogleOAuthButton } from './GoogleOAuthButton';
import { VerificationPending } from './VerificationPending';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/phone';

export function SignUpForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const validateForm = () => {
    if (formData.password.length < 12) {
      setError('Password must be at least 12 characters long');
      return false;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[a-z]/.test(formData.password)) {
      setError('Password must contain at least one lowercase letter');
      return false;
    }
    if (!/[0-9]/.test(formData.password)) {
      setError('Password must contain at least one number');
      return false;
    }
    if (!/[^A-Za-z0-9]/.test(formData.password)) {
      setError('Password must contain at least one special character');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!isValidPhoneNumber(formData.phone)) {
      setError('Please enter a valid phone number in international format (e.g., +919876543210)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Sign up failed');
      }

      setShowVerification(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'phone') {
      const formattedValue = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [field]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    setError('');
  };

  if (showVerification) {
    return <VerificationPending email={formData.email} phone={formData.phone} />;
  }

  return (
    <form id="signupForm" onSubmit={handleSubmit}>
      {error && (
        <div className="auth-error-box">
          <p>{error}</p>
        </div>
      )}

      <div className="auth-input-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          className="auth-input-field"
          placeholder="name@example.com"
          required
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="auth-input-group">
        <label>Phone Number</label>
        <input
          type="tel"
          name="phone"
          className="auth-input-field"
          placeholder="Phone number (with country code)"
          required
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="auth-input-group">
        <label>Password</label>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          className="auth-input-field"
          placeholder="Create password"
          required
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          disabled={loading}
        />
        <p className="auth-hint-text">Min 12 chars, 1 uppercase, 1 number, 1 special</p>
      </div>

      <div className="auth-input-group">
        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          className="auth-input-field"
          placeholder="Repeat password"
          required
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="auth-button-group">
        <button type="submit" className="auth-btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
        <div className="auth-btn-google">
          <GoogleOAuthButton mode="signup" iconOnly={true} />
        </div>
      </div>
    </form>
  );
}
