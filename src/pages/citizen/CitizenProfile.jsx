import React from 'react';
import { useMockData } from '../../contexts/MockDataContext';
import {
  User,
  MapPin,
  Phone,
  IdentificationCard,
  SignOut,
  Envelope,
  House,
  ShieldCheck,
  QrCode,
  Sparkle,
  LockKey
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 border-opacity-10">
    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-primary flex-shrink-0">
      <Icon size={16} />
    </div>
    <div className="flex-1">
      <p className="text-[10px] uppercase font-bold tracking-widest text-secondary m-0">{label}</p>
      <p className="font-semibold text-sm text-white m-0 mt-0.5">
        {value || <span className="opacity-40 font-normal">Not specified</span>}
      </p>
    </div>
  </div>
);

export default function CitizenProfile() {
  const { currentUser, complaints, logout } = useMockData();
  const navigate = useNavigate();

  const myCases = complaints.filter(c => c.citizenId === currentUser?.id && !c.isParent);
  const total = myCases.length;
  const active = myCases.filter(c => c.status !== 'Resolved' && c.status !== 'Solved').length;
  const resolved = myCases.filter(c => c.status === 'Resolved' || c.status === 'Solved').length;
  const overdue = myCases.filter(c => c.status === 'Overdue').length;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="border-b border-gray-100 border-opacity-10 pb-4">
        <h2 className="text-2xl font-extrabold text-white m-0 tracking-tight">Citizen Profile & Verification</h2>
        <p className="text-sm text-secondary m-0 mt-1">
          Authorized citizen identity, jurisdiction credentials, and grievance activity history.
        </p>
      </div>

      {/* ── Top Row: Resident Identity Card + KPI Metrics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Digital Resident Smart Card (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-[#102F31] to-[#071A1C] border border-primary border-opacity-35 shadow-[0_12px_36px_rgba(0,0,0,0.5)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-5 rounded-full filter blur-2xl" />

          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <ShieldCheck size={22} className="text-primary" weight="fill" />
                <span className="text-xs font-extrabold tracking-widest text-primary uppercase">GOVACTION CIVIC PASS</span>
              </div>
              <span className="text-[10px] font-mono text-success bg-success bg-opacity-15 px-2 py-0.5 rounded border border-success border-opacity-30 font-bold">
                VERIFIED CITIZEN
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-primary bg-opacity-15 border-2 border-primary border-opacity-40 text-primary flex items-center justify-center font-extrabold text-2xl shadow-md">
                {currentUser?.name?.charAt(0) || 'C'}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white m-0 leading-snug">{currentUser?.name}</h3>
                <p className="text-xs text-secondary m-0 mt-0.5 font-mono">ID: {currentUser?.citizenId || 'CIT-2026-0001'}</p>
                <p className="text-xs text-primary m-0 mt-0.5 font-medium">{currentUser?.district} District Jurisdiction</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 border-opacity-10 pt-4 flex justify-between items-center text-xs text-secondary font-mono">
            <div>
              <span className="block text-[9px] uppercase tracking-wider opacity-60">Authentication Tier</span>
              <span className="text-white font-bold">Level 3 (Biometric/Aadhaar linked)</span>
            </div>
            <QrCode size={32} className="text-primary opacity-80" />
          </div>
        </div>

        {/* 4 Metric Cards (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="civic-card flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Total Filed</span>
            <div className="text-3xl font-extrabold text-white my-1">{total}</div>
            <span className="text-[11px] text-secondary">Recorded issues</span>
          </div>
          <div className="civic-card flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Active</span>
            <div className="text-3xl font-extrabold text-primary my-1">{active}</div>
            <span className="text-[11px] text-primary">In progress</span>
          </div>
          <div className="civic-card flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Resolved</span>
            <div className="text-3xl font-extrabold text-success my-1">{resolved}</div>
            <span className="text-[11px] text-success">Verified closed</span>
          </div>
          <div className="civic-card flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Overdue</span>
            <div className="text-3xl font-extrabold text-critical my-1">{overdue}</div>
            <span className="text-[11px] text-critical">SLA Breached</span>
          </div>
        </div>
      </div>

      {/* ── Personal Info & Security ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Personal Info */}
        <div className="lg:col-span-8 civic-card">
          <h3 className="text-xs uppercase font-bold tracking-widest text-secondary m-0 mb-2 border-b border-gray-100 border-opacity-10 pb-2">
            Resident Contact & Electoral Records
          </h3>
          <InfoRow icon={IdentificationCard} label="Citizen Registration ID" value={currentUser?.citizenId} />
          <InfoRow icon={User} label="Legal Full Name" value={currentUser?.name} />
          <InfoRow icon={Phone} label="Primary Contact Phone" value={currentUser?.phone} />
          <InfoRow icon={Envelope} label="Verified Email" value={currentUser?.email} />
          <InfoRow icon={MapPin} label="District & Corporation" value={currentUser?.district} />
          <InfoRow icon={MapPin} label="Residential Ward / Area" value={currentUser?.area} />
          <InfoRow icon={House} label="Registered Address" value={currentUser?.address} />
        </div>

        {/* Right Column (4 cols): Security & Session */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="civic-card">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
              <LockKey size={18} />
              Session & Security
            </div>
            <p className="text-xs text-secondary leading-relaxed mb-4">
              Your session is cryptographically bound to your citizen profile. All submitted issues are signed with your verified resident token.
            </p>
            <button
              type="button"
              className="citizen-logout-btn"
              onClick={handleLogout}
            >
              <SignOut size={16} weight="bold" />
              Sign Out of Portal
            </button>
          </div>

          <div className="civic-card">
            <div className="flex items-center gap-2 text-success font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkle size={16} />
              Civic Participation Tier
            </div>
            <p className="text-xs text-secondary leading-relaxed m-0">
              You are recognized as an <strong>Active Civic Contributor</strong> in your municipal ward.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
