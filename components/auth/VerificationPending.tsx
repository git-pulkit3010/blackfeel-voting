'use client';

import { useState } from 'react';

interface VerificationPendingProps {
  email: string;
  phone?: string;
}

export function VerificationPending({ email, phone }: VerificationPendingProps) {
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    setResending(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage(data.detail || data.error || 'Failed to resend email');
      }
    } catch (err) {
      setMessage('Failed to resend email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-verification-container">
      <div className="auth-verification-content">
        <div className="auth-verification-icon">
          <svg
            className="w-6 h-6 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h2 className="auth-verification-title">
          Check your messages
        </h2>

        <p className="auth-verification-text">
          We&apos;ve sent a verification link to
          <br />
          <span className="auth-verification-highlight">{email}</span>
          {phone && (
            <>
              <br />
              and via WhatsApp to
              <br />
              <span className="auth-verification-highlight">{phone}</span>
            </>
          )}
        </p>

        <div className="auth-verification-info-box">
          <p className="font-medium">Please verify your account to continue</p>
          <p className="mt-1 opacity-80">Click the link in the email or WhatsApp message to activate your account.</p>
        </div>

        {message && (
          <div className={`auth-verification-message ${
            message.includes('sent') ? 'auth-verification-message-success' : 'auth-verification-message-error'
          }`}>
            <p>{message}</p>
          </div>
        )}

        <div className="auth-verification-resend">
          <p>
            Didn&apos;t receive the email?{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="auth-verification-resend-btn"
            >
              {resending ? 'Sending...' : 'Resend verification email'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
