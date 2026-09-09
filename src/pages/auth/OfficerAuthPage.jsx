import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeSlash, ArrowLeft, IdentificationCard, ShieldCheck } from '@phosphor-icons/react';
import AuthBackground from './AuthBackground';
import { loginOfficer, registerOfficer } from '../../services/authService';
import { useMockData } from '../../contexts/MockDataContext';
import OtpModal from '../../components/OtpModal';

const DEPARTMENTS = [
  'Municipality', 'Sanitation', 'Electrical / Local Body', 'Water Supply',
  'Roads & Highways', 'Revenue', 'Police', 'Health', 'Education',
  'Rural Development', 'Fire & Emergency Services', 'Town Planning', 'Other',
];

const DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
  'Tirunelveli', 'Vellore', 'Erode', 'Thoothukudi', 'Dindigul',
  'Thanjavur', 'Ranipet', 'Tiruppur', 'Krishnagiri', 'Other',
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

function AuthInput({ label, id, type = 'text', placeholder, value, onChange, required, children }) {
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>
        {label}{required && <span className="auth-required">*</span>}
      </label>
      <div className="auth-input-wrap">
        <input id={id} type={type} className="auth-input" placeholder={placeholder}
          value={value} onChange={onChange} required={required} autoComplete="off" />
        {children}
      </div>
    </div>
  );
}

function SelectInput({ label, id, value, onChange, required, options }) {
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>
        {label}{required && <span className="auth-required">*</span>}
      </label>
      <div className="auth-input-wrap">
        <select id={id} className="auth-input" value={value} onChange={onChange} required={required}>
          <option value="">Select {label}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
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
        <input id={id} type={show ? 'text' : 'password'} className="auth-input"
          placeholder={placeholder} value={value} onChange={onChange} required={required} autoComplete="new-password" />
        <button type="button" className="auth-input-icon-btn" onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeSlash size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

// ─── Officer Login ────────────────────────────────────────────────────────────

function OfficerLogin() {
  const navigate = useNavigate();
  const { login } = useMockData();
  const [form, setForm] = useState({ identifier: '', password: '', departmentName: '' });
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
    await new Promise(r => setTimeout(r, 400));

    const result = loginOfficer(form);
    if (!result.success) { setError(result.error); setLoading(false); return; }

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
    setTimeout(() => navigate('/officer/dashboard'), 700);
  };

  return (
    <div className="auth-card-wrapper">
      <div className={`auth-card ${success ? 'auth-card-success' : ''}`}>
        <div className="auth-card-header">
          <div className="auth-card-icon-wrap auth-icon-officer">
            <IdentificationCard size={28} weight="fill" />
          </div>
          <div>
            <h2 className="auth-card-title">Field Operations Portal</h2>
            <p className="auth-card-subtitle">Authorized personnel access</p>
          </div>
        </div>

        {success && <div className="auth-success-bar"><ShieldCheck size={16} weight="fill" /> Authenticated. Entering field operations…</div>}
        {error && <div className="auth-error-bar"><strong>Unable to sign in</strong><span>{error}</span></div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <AuthInput label="Employee ID / Official Username" id="off-identifier"
            placeholder="Enter your official ID or username" value={form.identifier} onChange={set('identifier')} required />
          <PasswordInput label="Password" id="off-password" placeholder="Enter your password"
            value={form.password} onChange={set('password')} required />
          <SelectInput label="Department" id="off-dept" value={form.departmentName}
            onChange={set('departmentName')} required options={DEPARTMENTS} />

          <button type="submit" className="auth-btn-primary auth-btn-officer" disabled={loading || success}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Authenticating…' : 'Secure Sign In'}
          </button>
        </form>

        <div className="auth-divider" />

        <div className="auth-links">
          <button type="button" className="auth-link-btn" style={{ color: 'var(--secondary)' }}
            onClick={() => navigate('/auth/officer/register')}>
            Register / Request Officer Access
          </button>
          <button type="button" className="auth-link-ghost">Forgot Password?</button>
        </div>

        <button type="button" className="auth-back-btn" onClick={() => navigate('/auth')}>
          <ArrowLeft size={16} /> Back to portal selection
        </button>
      </div>

      <OtpModal
        isOpen={showOtp}
        user={pendingUser}
        roleLabel="Field Officer"
        onSuccess={handleOtpSuccess}
        onCancel={() => setShowOtp(false)}
      />
    </div>
  );
}

// ─── Officer Registration ─────────────────────────────────────────────────────

function OfficerRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', employeeId: '', username: '', password: '', confirmPassword: '',
    designation: '', departmentName: '', district: '', office: '', phone: '', email: '',
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

    const result = registerOfficer(form);
    if (!result.success) { setError(result.error); setLoading(false); return; }

    setRegistered(result);
    setLoading(false);
  };

  if (registered) {
    return (
      <div className="auth-card-wrapper">
        <div className="auth-card auth-card-success">
          <div className="auth-success-hero">
            <ShieldCheck size={56} weight="fill" className="text-success auth-success-icon" />
            <h2 className="auth-card-title">Officer Account Created!</h2>
            <p className="auth-card-subtitle">Your Officer ID has been assigned</p>
            <div className="auth-id-badge auth-id-officer">{registered.officerId}</div>
            <div className="auth-status-badge auth-status-active">● Account Status: Active</div>
            <p className="auth-hint-text">Use your username and password to log in.</p>
          </div>
          <button className="auth-btn-primary auth-btn-officer" onClick={() => navigate('/auth/officer')}>
            Continue to Officer Login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card-wrapper auth-card-wide">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-card-icon-wrap auth-icon-officer">
            <IdentificationCard size={28} weight="fill" />
          </div>
          <div>
            <h2 className="auth-card-title">Officer Access Request</h2>
            <p className="auth-card-subtitle">Register your field officer account</p>
          </div>
        </div>

        {error && <div className="auth-error-bar"><strong>Registration Error</strong><span>{error}</span></div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-form-grid">
            <AuthInput label="Full Name" id="oreg-name" placeholder="Your full official name" value={form.fullName} onChange={set('fullName')} required />
            <AuthInput label="Employee ID" id="oreg-empid" placeholder="e.g. EMP-12345" value={form.employeeId} onChange={set('employeeId')} required />
            <AuthInput label="Official Username" id="oreg-username" placeholder="Choose a username" value={form.username} onChange={set('username')} required />
            <AuthInput label="Designation" id="oreg-desig" placeholder="e.g. Field Inspector" value={form.designation} onChange={set('designation')} />
            <PasswordInput label="Password" id="oreg-pw" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
            <PasswordInput label="Confirm Password" id="oreg-cpw" placeholder="Repeat your password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
            <SelectInput label="Department" id="oreg-dept" value={form.departmentName} onChange={set('departmentName')} required options={DEPARTMENTS} />
            <SelectInput label="District" id="oreg-dist" value={form.district} onChange={set('district')} required options={DISTRICTS} />
            <AuthInput label="Office Location" id="oreg-office" placeholder="Office address" value={form.office} onChange={set('office')} />
            <AuthInput label="Official Phone" id="oreg-phone" placeholder="Office phone number" value={form.phone} onChange={set('phone')} />
          </div>
          <AuthInput label="Official Email" id="oreg-email" type="email" placeholder="official@gov.in" value={form.email} onChange={set('email')} />

          <button type="submit" className="auth-btn-primary auth-btn-officer" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Registering…' : 'Submit Registration'}
          </button>
        </form>

        <div className="auth-links">
          <span className="auth-muted-text">Already registered?</span>
          <button type="button" className="auth-link-btn" style={{ color: 'var(--secondary)' }} onClick={() => navigate('/auth/officer')}>Sign In</button>
        </div>

        <button type="button" className="auth-back-btn" onClick={() => navigate('/auth')}>
          <ArrowLeft size={16} /> Back to portal selection
        </button>
      </div>
    </div>
  );
}

// ─── Route wrapper ────────────────────────────────────────────────────────────

export default function OfficerAuthPage({ mode }) {
  return (
    <AuthBackground>
      {mode === 'register' ? <OfficerRegister /> : <OfficerLogin />}
    </AuthBackground>
  );
}
