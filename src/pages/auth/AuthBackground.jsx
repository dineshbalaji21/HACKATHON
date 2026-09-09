import React from 'react';
import { ShieldCheck } from '@phosphor-icons/react';

/**
 * Shared full-screen auth background with grid + radial civic glow.
 * Wraps all auth pages.
 */
export default function AuthBackground({ children }) {
  return (
    <div className="auth-bg">
      {/* Grid overlay */}
      <div className="auth-grid" aria-hidden="true" />
      {/* Radial glow top */}
      <div className="auth-glow-top" aria-hidden="true" />
      {/* Radial glow bottom */}
      <div className="auth-glow-bottom" aria-hidden="true" />

      <div className="auth-bg-inner">
        {/* Brand bar */}
        <div className="auth-brand">
          <ShieldCheck size={28} className="text-primary animate-ai-glow" weight="fill" />
          <div>
            <div className="auth-brand-name">GovAction AI</div>
            <div className="auth-brand-sub">Civic Intelligence &amp; Government Action Platform</div>
          </div>
        </div>

        {children}

        <div className="auth-footer">
          Secure access for citizens and government officials
        </div>
      </div>
    </div>
  );
}
