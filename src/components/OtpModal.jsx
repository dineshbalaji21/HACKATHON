import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  WarningCircle,
  CheckCircle
} from '@phosphor-icons/react';
import Button from './Button';
import './OtpModal.css';

/**
 * Reusable simulated OTP verification modal.
 * Complies with requirement:
 * - Dynamic generation
 * - 60s expiration
 * - Resend functionality
 * - Correct validation
 * - Clear FRONTEND DEMO disclaimer (no claim of real SMS gateway)
 */
export default function OtpModal({
  isOpen,
  user,
  roleLabel = 'User',
  onSuccess,
  onCancel
}) {
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef(null);

  // Generate dynamic 6-digit OTP
  const generateNewOtp = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setSecondsLeft(60);
    setError('');
    setInputCode('');
  };

  useEffect(() => {
    if (isOpen) {
      generateNewOtp();
      setIsSuccess(false);
      setIsVerifying(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Expiration countdown
  useEffect(() => {
    if (!isOpen || secondsLeft <= 0 || isSuccess) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, secondsLeft, isSuccess]);

  if (!isOpen) return null;

  const handleVerify = (e) => {
    if (e) e.preventDefault();
    setError('');

    if (secondsLeft <= 0) {
      setError('Verification code has expired. Please request a new code.');
      return;
    }

    if (inputCode.trim().length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    if (inputCode.trim() !== generatedOtp) {
      setError('Invalid verification code. Please check the code and try again.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 700);
    }, 450);
  };

  const handleQuickFill = () => {
    setInputCode(generatedOtp);
    setError('');
  };

  return (
    <div className="otp-modal-backdrop" onClick={onCancel}>
      <div className="otp-modal-card" onClick={e => e.stopPropagation()}>
        <div className="otp-modal-accent" />

        <div className="otp-header">
          <div className="otp-icon-wrap">
            <ShieldCheck size={26} weight="fill" />
          </div>
          <div>
            <h3 className="otp-title">Two-Factor Authentication</h3>
            <p className="otp-subtitle">
              Verify your {roleLabel} session credentials
            </p>
          </div>
        </div>

        {/* Frontend Demo Banner */}
        <div className="otp-demo-banner">
          <div className="otp-demo-tag">
            <WarningCircle size={14} weight="fill" /> Simulated OTP (Frontend Demo)
          </div>
          <p className="otp-demo-text">
            In a live government deployment, a one-time passcode is dispatched via SMS gateway. For this prototype evaluation, use the code below:
          </p>
          <div className="otp-code-display">
            <span className="otp-code-value">{generatedOtp}</span>
            <span className="otp-code-hint" onClick={handleQuickFill}>
              Click to Auto-fill
            </span>
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleVerify}>
          <div className="otp-input-section">
            <label className="otp-input-label">Enter 6-Digit Verification Code</label>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              maxLength={6}
              className={`otp-digits-input ${error ? 'has-error' : ''}`}
              placeholder="••••••"
              value={inputCode}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setInputCode(val);
                if (error) setError('');
              }}
              disabled={isVerifying || isSuccess}
            />

            <div className="otp-timer-row">
              <span>
                Expires in:{' '}
                <strong className={`otp-timer-badge ${secondsLeft <= 10 ? 'expired' : ''}`}>
                  {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
                </strong>
              </span>
              <button
                type="button"
                className="otp-resend-btn"
                onClick={generateNewOtp}
                disabled={secondsLeft > 45 || isVerifying || isSuccess}
              >
                Resend Code
              </button>
            </div>

            {error && (
              <div className="otp-error-msg">
                <WarningCircle size={14} weight="fill" />
                <span>{error}</span>
              </div>
            )}

            {isSuccess && (
              <div className="otp-error-msg" style={{ color: '#5BD58A' }}>
                <CheckCircle size={14} weight="fill" />
                <span>Verification confirmed. Establishing secure session…</span>
              </div>
            )}
          </div>

          <div className="otp-modal-footer">
            <Button
              type="button"
              variant="secondary"
              size="md"
              style={{ flex: 1 }}
              onClick={onCancel}
              disabled={isVerifying || isSuccess}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              style={{ flex: 1 }}
              disabled={inputCode.length !== 6 || isVerifying || isSuccess}
              loading={isVerifying}
              loadingText="Verifying..."
            >
              Verify &amp; Enter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
