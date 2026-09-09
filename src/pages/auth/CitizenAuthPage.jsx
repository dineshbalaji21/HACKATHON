import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeSlash, ArrowLeft, User, ShieldCheck } from '@phosphor-icons/react';
import AuthBackground from './AuthBackground';
import { loginCitizen, registerCitizen } from '../../services/authService';
import { useMockData } from '../../contexts/MockDataContext';
import OtpModal from '../../components/OtpModal';

// ─── Shared styled input ──────────────────────────────────────────────────────

function AuthInput({ label, id, type = 'text', placeholder, value, onChange, required, children }) {
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>
        {label}{required && <span className="auth-required">*</span>}
      </label>
      <div className="auth-input-wrap">
        <input
          id={id}
          type={type}
          className="auth-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete="off"
        />
        {children}
      </div>
    </div>
  );
}

function PasswordInput({ label, id, placeholder, value, onChange, required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>
        {label}{required && <span className="auth-required">*</span>}
      </label>
      <div className="auth-input-wrap">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className="auth-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="auth-input-icon-btn"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeSlash size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

// ─── Citizen Login ────────────────────────────────────────────────────────────

function CitizenLogin() {
  const navigate = useNavigate();
  const { login } = useMockData();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [showOtp, setShowOtp] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 400)); // Simulate validation

    const result = loginCitizen({ identifier: form.identifier, password: form.password });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    setPendingUser(result.user);
    setShowOtp(true);
  };

  const handleOtpSuccess = () => {
    if (pendingUser) {
      login(pendingUser);
    }
    setShowOtp(false);
    setSuccess(true);
    setTimeout(() => navigate('/citizen/home'), 600);
  };

  return (
    <div className="auth-card-wrapper">
      <div className={`auth-card ${success ? 'auth-card-success' : ''}`}>
        {/* Header */}
        <div className="auth-card-header">
          <div className="auth-card-icon-wrap auth-icon-citizen">
            <User size={28} weight="fill" />
          </div>
          <div>
            <h2 className="auth-card-title">Citizen Portal</h2>
            <p className="auth-card-subtitle">Access your civic grievance account</p>
          </div>
        </div>

        {success && (
          <div className="auth-success-bar">
            <ShieldCheck size={16} weight="fill" /> Sign-in successful. Redirecting…
          </div>
        )}

        {error && (
          <div className="auth-error-bar">
            <strong>Unable to sign in</strong>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <AuthInput
            label="Citizen ID / Username"
            id="citizen-identifier"
            placeholder="Enter Citizen ID or username"
            value={form.identifier}
            onChange={set('identifier')}
            required
          />
          <PasswordInput
            label="Password"
            id="citizen-password"
            placeholder="Enter your password"
            value={form.password}
            onChange={set('password')}
            required
          />

          <button type="submit" className="auth-btn-primary" disabled={loading || success}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider" />

        <div className="auth-links">
          <button
            type="button"
            className="auth-link-btn auth-link-secondary"
            onClick={() => navigate('/auth/citizen/register')}
          >
            Create Citizen Account
          </button>
          <button type="button" className="auth-link-ghost">
            Forgot Password?
          </button>
        </div>

        <button
          type="button"
          className="auth-back-btn"
          onClick={() => navigate('/auth')}
        >
          <ArrowLeft size={16} /> Back to portal selection
        </button>
      </div>

      <OtpModal
        isOpen={showOtp}
        user={pendingUser}
        roleLabel="Citizen"
        onSuccess={handleOtpSuccess}
        onCancel={() => setShowOtp(false)}
      />
    </div>
  );
}

// ─── Citizen Registration ─────────────────────────────────────────────────────

const DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
  'Tirunelveli', 'Vellore', 'Erode', 'Thoothukudi', 'Dindigul',
  'Thanjavur', 'Ranipet', 'Tiruppur', 'Krishnagiri', 'Other',
];

function CitizenRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', username: '', password: '', confirmPassword: '',
    phone: '', email: '', district: '', area: '', address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(null);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 700));

    const result = registerCitizen(form);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setRegistered(result);
    setLoading(false);
  };

  if (registered) {
    return (
      <div className="auth-card-wrapper">
        <div className="auth-card auth-card-success">
          <div className="auth-success-hero">
            <ShieldCheck size={56} weight="fill" className="text-success auth-success-icon" />
            <h2 className="auth-card-title">Account Created!</h2>
            <p className="auth-card-subtitle">Your Citizen ID has been generated</p>
            <div className="auth-id-badge">{registered.citizenId}</div>
            <p className="auth-hint-text">Save your Citizen ID — you'll need it to log in.</p>
          </div>
          <button
            className="auth-btn-primary"
            onClick={() => navigate('/auth/citizen')}
          >
            Continue to Login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card-wrapper auth-card-wide">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-card-icon-wrap auth-icon-citizen">
            <User size={28} weight="fill" />
          </div>
          <div>
            <h2 className="auth-card-title">Create Citizen Account</h2>
            <p className="auth-card-subtitle">Join the GovAction AI civic platform</p>
          </div>
        </div>

        {error && (
          <div className="auth-error-bar">
            <strong>Registration Error</strong>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-form-grid">
            <AuthInput label="Full Name" id="reg-name" placeholder="Your full name" value={form.fullName} onChange={set('fullName')} required />
            <AuthInput label="Username" id="reg-username" placeholder="Choose a username" value={form.username} onChange={set('username')} required />
            <PasswordInput label="Password" id="reg-password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
            <PasswordInput label="Confirm Password" id="reg-confirm" placeholder="Repeat your password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
            <AuthInput label="Phone Number" id="reg-phone" placeholder="10-digit mobile number" value={form.phone} onChange={set('phone')} required />
            <AuthInput label="Email" id="reg-email" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} />
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-district">District<span className="auth-required">*</span></label>
              <div className="auth-input-wrap">
                <select id="reg-district" className="auth-input" value={form.district} onChange={set('district')} required>
                  <option value="">Select your district</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <AuthInput label="Area / Ward" id="reg-area" placeholder="Ward / locality name" value={form.area} onChange={set('area')} />
          </div>
          <AuthInput label="Address" id="reg-address" placeholder="Full residential address" value={form.address} onChange={set('address')} />

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-links">
          <span className="auth-muted-text">Already have an account?</span>
          <button type="button" className="auth-link-btn auth-link-secondary" onClick={() => navigate('/auth/citizen')}>
            Sign In
          </button>
        </div>

        <button type="button" className="auth-back-btn" onClick={() => navigate('/auth')}>
          <ArrowLeft size={16} /> Back to portal selection
        </button>
      </div>
    </div>
  );
}

// ─── Route wrapper ────────────────────────────────────────────────────────────

export default function CitizenAuthPage({ mode }) {
  return (
    <AuthBackground>
      {mode === 'register' ? <CitizenRegister /> : <CitizenLogin />}
    </AuthBackground>
  );
}
