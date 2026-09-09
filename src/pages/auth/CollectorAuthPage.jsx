import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeSlash, ArrowLeft, Crown, ShieldCheck, Lock } from '@phosphor-icons/react';
import AuthBackground from './AuthBackground';
import { loginCollector, registerCollector } from '../../services/authService';
import { useMockData } from '../../contexts/MockDataContext';
import OtpModal from '../../components/OtpModal';

const DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
  'Tirunelveli', 'Vellore', 'Erode', 'Thoothukudi', 'Dindigul',
  'Thanjavur', 'Ranipet', 'Tiruppur', 'Krishnagiri', 'Other',
];

function AuthInput({ label, id, type = 'text', placeholder, value, onChange, required }) {
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>{label}{required && <span className="auth-required">*</span>}</label>
      <div className="auth-input-wrap">
        <input id={id} type={type} className="auth-input" placeholder={placeholder}
          value={value} onChange={onChange} required={required} autoComplete="off" />
      </div>
    </div>
  );
}

function SelectInput({ label, id, value, onChange, required, options }) {
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>{label}{required && <span className="auth-required">*</span>}</label>
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
      <label className="auth-label" htmlFor={id}>{label}{required && <span className="auth-required">*</span>}</label>
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

function PinInput({ label, id, placeholder, value, onChange, required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>{label}{required && <span className="auth-required">*</span>}</label>
      <div className="auth-input-wrap">
        <input id={id} type={show ? 'text' : 'password'} className="auth-input auth-input-pin"
          placeholder={placeholder} value={value} onChange={onChange} required={required}
          maxLength={8} autoComplete="off" />
        <Lock size={16} className="auth-input-lock-icon" />
        <button type="button" className="auth-input-icon-btn" onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide PIN' : 'Show PIN'}>
          {show ? <EyeSlash size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

// ─── Collector Login ──────────────────────────────────────────────────────────

function CollectorLogin() {
  const navigate = useNavigate();
  const { login } = useMockData();
  const [form, setForm] = useState({ identifier: '', password: '', district: '', verificationPin: '' });
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

    const result = loginCollector(form);
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
    setTimeout(() => navigate('/collector/dashboard'), 600);
  };

  return (
    <div className="auth-card-wrapper">
      <div className={`auth-card auth-card-collector ${success ? 'auth-card-success' : ''}`}>
        {/* Premium collector header */}
        <div className="collector-card-crest">
          <div className="collector-crest-icon">
            <Crown size={32} weight="fill" />
          </div>
          <div className="collector-crest-lines" aria-hidden="true">
            <div /><div /><div />
          </div>
        </div>

        <div className="auth-card-header auth-card-header-collector">
          <div>
            <h2 className="auth-card-title auth-card-title-collector">District Command Center</h2>
            <p className="auth-card-subtitle">Authorized District Administration Access</p>
          </div>
        </div>

        {success && (
          <div className="auth-success-bar auth-success-collector">
            <ShieldCheck size={16} weight="fill" /> Identity verified. Entering command center…
          </div>
        )}
        {error && <div className="auth-error-bar"><strong>Access Denied</strong><span>{error}</span></div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <AuthInput label="Collector ID / Official Username" id="col-id"
            placeholder="Enter Collector ID or username" value={form.identifier} onChange={set('identifier')} required />
          <PasswordInput label="Password" id="col-pw" placeholder="Enter your password"
            value={form.password} onChange={set('password')} required />
          <SelectInput label="District" id="col-dist" value={form.district}
            onChange={set('district')} required options={DISTRICTS} />
          <PinInput label="Official Verification PIN" id="col-pin"
            placeholder="Enter your verification PIN"
            value={form.verificationPin} onChange={set('verificationPin')} required />

          <button type="submit" className="auth-btn-primary auth-btn-collector" disabled={loading || success}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Verifying Identity…' : 'Enter Command Center'}
          </button>
        </form>

        <div className="auth-divider" />

        <div className="auth-links">
          <button type="button" className="auth-link-btn auth-link-collector"
            onClick={() => navigate('/auth/collector/register')}>
            Setup Collector Account
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
        roleLabel="District Collector"
        onSuccess={handleOtpSuccess}
        onCancel={() => setShowOtp(false)}
      />
    </div>
  );
}

// ─── Collector Registration ───────────────────────────────────────────────────

function CollectorRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', username: '', password: '', confirmPassword: '',
    designation: '', district: '', collectorateOffice: '',
    phone: '', email: '', verificationPin: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(null);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const result = registerCollector(form);
    if (!result.success) { setError(result.error); setLoading(false); return; }

    setRegistered(result);
    setLoading(false);
  };

  if (registered) {
    return (
      <div className="auth-card-wrapper">
        <div className="auth-card auth-card-collector auth-card-success">
          <div className="auth-success-hero">
            <ShieldCheck size={56} weight="fill" className="auth-success-icon" style={{ color: 'var(--success)' }} />
            <h2 className="auth-card-title">Collector Account Established!</h2>
            <p className="auth-card-subtitle">District Command access is ready</p>
            <div className="auth-id-badge auth-id-collector">{registered.collectorId}</div>
            <div className="auth-status-badge auth-status-active">● Account Status: Active</div>
            <p className="auth-hint-text">Use your username, password, and verification PIN to access the command center.</p>
          </div>
          <button className="auth-btn-primary auth-btn-collector" onClick={() => navigate('/auth/collector')}>
            Enter Command Center →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card-wrapper auth-card-wide">
      <div className="auth-card auth-card-collector">
        <div className="auth-card-header">
          <div className="auth-card-icon-wrap auth-icon-collector">
            <Crown size={28} weight="fill" />
          </div>
          <div>
            <h2 className="auth-card-title">District Collector Setup</h2>
            <p className="auth-card-subtitle">Establish your district command account</p>
          </div>
        </div>

        {error && <div className="auth-error-bar"><strong>Setup Error</strong><span>{error}</span></div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-form-grid">
            <AuthInput label="Full Name" id="creg-name" placeholder="Full official name" value={form.fullName} onChange={set('fullName')} required />
            <AuthInput label="Official Username" id="creg-uname" placeholder="Choose a username" value={form.username} onChange={set('username')} required />
            <PasswordInput label="Password" id="creg-pw" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
            <PasswordInput label="Confirm Password" id="creg-cpw" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
            <AuthInput label="Designation" id="creg-desig" placeholder="e.g. IAS, District Collector" value={form.designation} onChange={set('designation')} />
            <SelectInput label="District" id="creg-dist" value={form.district} onChange={set('district')} required options={DISTRICTS} />
            <AuthInput label="Collectorate Office" id="creg-office" placeholder="Office address" value={form.collectorateOffice} onChange={set('collectorateOffice')} />
            <AuthInput label="Official Phone" id="creg-phone" placeholder="Office contact number" value={form.phone} onChange={set('phone')} />
          </div>
          <AuthInput label="Official Email" id="creg-email" type="email" placeholder="collector@ias.gov.in" value={form.email} onChange={set('email')} />
          <PinInput label="Set Verification PIN (min. 4 characters)" id="creg-pin"
            placeholder="Create a secure verification PIN"
            value={form.verificationPin} onChange={set('verificationPin')} required />
          <p className="auth-hint-text auth-hint-pin">
            <Lock size={12} /> This PIN will be required every time you log in. Keep it secure.
          </p>

          <button type="submit" className="auth-btn-primary auth-btn-collector" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Establishing Account…' : 'Establish Command Account'}
          </button>
        </form>

        <div className="auth-links">
          <span className="auth-muted-text">Already set up?</span>
          <button type="button" className="auth-link-btn auth-link-collector" onClick={() => navigate('/auth/collector')}>
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

export default function CollectorAuthPage({ mode }) {
  return (
    <AuthBackground>
      {mode === 'register' ? <CollectorRegister /> : <CollectorLogin />}
    </AuthBackground>
  );
}
