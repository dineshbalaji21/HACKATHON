import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKey, ArrowLeft } from '@phosphor-icons/react';

export default function AccessRestricted() {
  const navigate = useNavigate();

  // Determine the right dashboard for the current user
  const getDashboardRoute = () => {
    try {
      const session = JSON.parse(localStorage.getItem('govAction_session'));
      if (!session) return '/auth';
      switch (session.role) {
        case 'citizen': return '/citizen/home';
        case 'officer': return '/officer/dashboard';
        case 'department_head': return '/department/dashboard';
        case 'district_collector': return '/collector/dashboard';
        default: return '/auth';
      }
    } catch {
      return '/auth';
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-main)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundImage:
          'linear-gradient(rgba(57,230,208,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(57,230,208,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      <div
        style={{
          background: 'rgba(16,47,49,0.8)',
          border: '1px solid rgba(255,107,107,0.3)',
          borderRadius: '16px',
          padding: '3rem 2.5rem',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(255,107,107,0.08), 0 20px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(255,107,107,0.12)',
            border: '1px solid rgba(255,107,107,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <LockKey size={36} weight="fill" style={{ color: 'var(--critical)' }} />
        </div>

        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--critical)',
            marginBottom: '0.75rem',
          }}
        >
          Access Restricted
        </h2>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}
        >
          You do not have permission to access this area. This portal is restricted to authorized personnel only.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => navigate(getDashboardRoute())}
            style={{
              background: 'rgba(57,230,208,0.1)',
              border: '1px solid rgba(57,230,208,0.4)',
              color: 'var(--primary)',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.target.style.background = 'rgba(57,230,208,0.18)';
              e.target.style.boxShadow = '0 0 16px rgba(57,230,208,0.2)';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'rgba(57,230,208,0.1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Return to Dashboard
          </button>

          <button
            onClick={() => navigate('/auth')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.5rem',
            }}
          >
            <ArrowLeft size={14} /> Back to Portal Selection
          </button>
        </div>
      </div>
    </div>
  );
}
