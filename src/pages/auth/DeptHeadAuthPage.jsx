import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeSlash, ArrowLeft, Buildings, ShieldCheck } from '@phosphor-icons/react';
import AuthBackground from './AuthBackground';
import { loginDeptHead, registerDeptHead } from '../../services/authService';
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

// ─── Dept Head Login ──────────────────────────────────────────────────────────

function DeptHeadLogin() {
  const navigate = useNavigate();
  const { login } = useMockData();
  const [form, setForm] = useState({ identifier: '', password: '', departmentName: '', district: '' });
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

    const result = loginDeptHead(form);
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
    setTimeout(() => navigate('/department/dashboard'), 600);
  };

  return (
    <div className="auth-card-wrapper">
      <div className={`auth-card ${success ? 'auth-card-success' : ''}`}>
        <div className="auth-card-header">
          <div className="auth-card-icon-wrap auth-icon-dept">
            <Buildings size={28} weight="fill" />
          </div>
          <div>
            <h2 className="auth-card-title">Department Command Portal</h2>
            <p className="auth-card-subtitle">Authorized Department Administration</p>
          </div>
        </div>

        {success && <div className="auth-success-bar"><ShieldCheck size={16} weight="fill" /> Authenticated. Entering command portal…</div>}
        {error && <div className="auth-error-bar"><strong>Unable to sign in</strong><span>{error}</span></div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <AuthInput label="Department Head ID / Official Username" id="dh-id"
            placeholder="Enter Head ID or username" value={form.identifier} onChange={set('identifier')} required />
          <PasswordInput label="Password" id="dh-pw" placeholder="Enter your password"
            value={form.password} onChange={set('password')} required />
          <SelectInput label="Department" id="dh-dept" value={form.departmentName}
            onChange={set('departmentName')} required options={DEPARTMENTS} />
          <SelectInput label="District" id="dh-dist" value={form.district}
            onChange={set('district')} required options={DISTRICTS} />

          <button type="submit" className="auth-btn-primary auth-btn-dept" disabled={loading || success}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Authenticating…' : 'Secure Sign In'}
          </button>
        </form>

        <div className="auth-divider" />

        <div className="auth-links">
          <button type="button" className="auth-link-btn auth-link-dept"
            onClick={() => navigate('/auth/department-head/register')}>
            Department Head Access Request
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
        roleLabel="Department Head"
        onSuccess={handleOtpSuccess}
        onCancel={() => setShowOtp(false)}
      />
    </div>
  );
}

// ─── Dept Head Registration ───────────────────────────────────────────────────

function DeptHeadRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', username: '', password: '', confirmPassword: '',
    designation: '', departmentName: '', departmentId: '', district: '',
    office: '', phone: '', email: '',
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

    const result = registerDeptHead(form);
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
            <h2 className="auth-card-title">Department Head Account Created!</h2>
            <p className="auth-card-subtitle">Your Head ID has been assigned</p>
            <div className="auth-id-badge auth-id-dept">{registered.headId}</div>
            <div className="auth-status-badge auth-status-active">● Account Status: Active</div>
            <p className="auth-hint-text">Log in with your username and password.</p>
          </div>
          <button className="auth-btn-primary auth-btn-dept" onClick={() => navigate('/auth/department-head')}>
            Continue to Department Login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card-wrapper auth-card-wide">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-card-icon-wrap auth-icon-dept">
            <Buildings size={28} weight="fill" />
          </div>
          <div>
            <h2 className="auth-card-title">Department Head Access Request</h2>
            <p className="auth-card-subtitle">Register your department command account</p>
          </div>
        </div>

        {error && <div className="auth-error-bar"><strong>Registration Error</strong><span>{error}</span></div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-form-grid">
            <AuthInput label="Full Name" id="dhreg-name" placeholder="Full official name" value={form.fullName} onChange={set('fullName')} required />
            <AuthInput label="Official Username" id="dhreg-uname" placeholder="Choose a username" value={form.username} onChange={set('username')} required />
            <PasswordInput label="Password" id="dhreg-pw" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
            <PasswordInput label="Confirm Password" id="dhreg-cpw" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
            <AuthInput label="Designation" id="dhreg-desig" placeholder="e.g. Executive Engineer" value={form.designation} onChange={set('designation')} />
            <SelectInput label="Department" id="dhreg-dept" value={form.departmentName} onChange={set('departmentName')} required options={DEPARTMENTS} />
            <AuthInput label="Department ID (optional)" id="dhreg-deptid" placeholder="e.g. DPT-MUN-042" value={form.departmentId} onChange={set('departmentId')} />
            <SelectInput label="District" id="dhreg-dist" value={form.district} onChange={set('district')} required options={DISTRICTS} />
            <AuthInput label="Office Location" id="dhreg-office" placeholder="Department office address" value={form.office} onChange={set('office')} />
            <AuthInput label="Official Phone" id="dhreg-phone" placeholder="Office contact number" value={form.phone} onChange={set('phone')} />
          </div>
          <AuthInput label="Official Email" id="dhreg-email" type="email" placeholder="official@gov.in" value={form.email} onChange={set('email')} />

          <button type="submit" className="auth-btn-primary auth-btn-dept" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Submitting…' : 'Submit Access Request'}
          </button>
        </form>

        <div className="auth-links">
          <span className="auth-muted-text">Already registered?</span>
          <button type="button" className="auth-link-btn auth-link-dept" onClick={() => navigate('/auth/department-head')}>Sign In</button>
        </div>

        <button type="button" className="auth-back-btn" onClick={() => navigate('/auth')}>
          <ArrowLeft size={16} /> Back to portal selection
        </button>
      </div>
    </div>
  );
}

export default function DeptHeadAuthPage({ mode }) {
  return (
    <AuthBackground>
      {mode === 'register' ? <DeptHeadRegister /> : <DeptHeadLogin />}
    </AuthBackground>
  );
}
