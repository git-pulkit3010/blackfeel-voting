'use client';

import { useState } from 'react';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="auth-split-screen">
      <section className="auth-visual-side">
        <div className="auth-visual-overlay"></div>
        <div className="auth-brand-identity">
          <div className="auth-logo-container">
            <svg className="auth-swan-icon" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 50 C 20 20, 50 10, 50 30 C 50 50, 80 50, 80 30" stroke="white" fill="none" strokeWidth="3" />
              <line x1="10" y1="55" x2="90" y2="55" stroke="white" strokeWidth="2" />
            </svg>
            <span className="auth-brand-name">BlackWeave</span>
          </div>
        </div>
        <div className="auth-marketing-copy">
          <h1>Half code, Half culture.<br />Designed with AI. Felt in real life.</h1>
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-wrapper">
          <header className="auth-form-header">
            <h2>{mode === 'signin' ? 'Welcome Back!' : 'Create account'}</h2>
          </header>

          {mode === 'signin' ? <SignInForm /> : <SignUpForm />}

          <footer className="auth-footer-link">
            {mode === 'signin'
              ? <>New to BlackWeave? <button onClick={() => setMode('signup')}>Sign up</button></>
              : <>Already a member? <button onClick={() => setMode('signin')}>Log in</button></>
            }
          </footer>
        </div>
      </section>
    </div>
  );
}
