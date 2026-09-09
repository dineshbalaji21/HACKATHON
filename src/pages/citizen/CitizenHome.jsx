import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import {
  Plus,
  Microphone,
  Camera,
  MapPin,
  Clock,
  ArrowRight,
  ShieldWarning,
  CheckCircle,
  WarningCircle,
  Buildings,
  Pulse,
  Sparkle,
  HourglassHigh,
  ArrowClockwise,
  UserCheck,
  CalendarBlank,
  ChartLineUp
} from '@phosphor-icons/react';
import './CitizenDashboard.css';
import StatusBadge from '../../components/StatusBadge';
import RiskTooltip from '../../components/RiskTooltip';

export default function CitizenHome() {
  const navigate = useNavigate();
  const { complaints, currentUser } = useMockData();

  // Filter cases belonging to the current citizen (excluding parent containers of multi-cases)
  const myCases = complaints.filter(c => c.citizenId === currentUser?.id && !c.isParent);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const citizenFirstName = currentUser?.name?.split(' ')[0] || 'Citizen';

  // Compute live KPIs from actual data
  const activeCases = myCases.filter(c => c.status !== 'Resolved' && c.status !== 'Solved');
  const inProgressCases = myCases.filter(c => c.status === 'In Progress');
  const resolvedCases = myCases.filter(c => c.status === 'Resolved' || c.status === 'Solved');
  const overdueCases = myCases.filter(c => c.status === 'Overdue');
  const reopenedCases = myCases.filter(c => c.status === 'Reopened' || (c.reopenCount && c.reopenCount > 0));
  const verificationNeeded = myCases.filter(c => c.status === 'Resolved');

  // Verification rate calculation
  const verificationRate = resolvedCases.length > 0
    ? Math.round((myCases.filter(c => c.status === 'Solved').length / resolvedCases.length) * 100)
    : 100;

  // Format risk level
  const getRiskBadge = (complaint) => {
    const score = complaint.riskScore || 35;
    if (score >= 70 || complaint.priority === 'Critical') {
      return <span className="citizen-risk-tag risk-critical">HIGH RISK</span>;
    }
    if (score >= 45 || complaint.priority === 'High') {
      return <span className="citizen-risk-tag risk-medium">MODERATE RISK</span>;
    }
    return <span className="citizen-risk-tag risk-low">STANDARD</span>;
  };


  // Upcoming deadlines calculation
  const casesWithDeadlines = myCases
    .filter(c => c.expectedResolution && c.status !== 'Solved')
    .slice(0, 3);

  // Latest active case for the resolution activity milestone tracker
  const latestTrackedCase = activeCases[0] || myCases[0];

  return (
    <div className="citizen-dashboard">
      {/* ── 1. Hero Section ── */}
      <section className="citizen-hero-card">
        <div className="citizen-hero-content">
          <div className="citizen-hero-greeting">
            <Sparkle size={16} weight="fill" />
            <span>{getGreeting()}, {citizenFirstName}</span>
          </div>
          <h2 className="citizen-hero-title">What would you like to resolve today?</h2>
          <p className="citizen-hero-desc">
            Report a civic issue and let GovAction AI identify the right department and track the action until resolution.
          </p>

          <div className="citizen-hero-actions">
            <button
              type="button"
              className="citizen-primary-report-btn"
              onClick={() => navigate('/citizen/report')}
            >
              <Plus size={18} weight="bold" />
              Report a Civic Issue
            </button>

            <div className="citizen-quick-action-pills">
              <button
                type="button"
                className="citizen-quick-pill"
                onClick={() => navigate('/citizen/report', { state: { initialMode: 'voice' } })}
              >
                <Microphone size={14} weight="fill" className="citizen-quick-pill-icon" />
                <span>Speak</span>
              </button>
              <button
                type="button"
                className="citizen-quick-pill"
                onClick={() => navigate('/citizen/report', { state: { initialStep: 2 } })}
              >
                <Camera size={14} weight="fill" className="citizen-quick-pill-icon" />
                <span>Add Evidence</span>
              </button>
              <button
                type="button"
                className="citizen-quick-pill"
                onClick={() => navigate('/citizen/report', { state: { initialStep: 3 } })}
              >
                <MapPin size={14} weight="fill" className="citizen-quick-pill-icon" />
                <span>Report Location</span>
              </button>
            </div>
          </div>
        </div>

        {/* Civic AI Vector Graphic */}
        <div className="citizen-hero-visual" aria-hidden="true">
          <svg className="hero-vector-svg" viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gridGrad" x1="0" y1="0" x2="280" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#39E6D0" stopOpacity="0.25" />
                <stop offset="1" stopColor="#39E6D0" stopOpacity="0.02" />
              </linearGradient>
              <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop stopColor="#39E6D0" stopOpacity="0.8" />
                <stop offset="1" stopColor="#39E6D0" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Isometric city radar grid */}
            <path d="M40 130 L140 70 L240 130 L140 190 Z" stroke="url(#gridGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M70 130 L140 90 L210 130 L140 170 Z" stroke="url(#gridGrad)" strokeWidth="1" />
            <path d="M100 130 L140 110 L180 130 L140 150 Z" stroke="url(#gridGrad)" strokeWidth="1" />

            {/* Neural network link lines */}
            <line x1="140" y1="70" x2="140" y2="25" stroke="#39E6D0" strokeWidth="1.5" strokeDasharray="4 2" />
            <line x1="70" y1="130" x2="140" y2="70" stroke="#39E6D0" strokeWidth="1.5" opacity="0.6" />
            <line x1="210" y1="130" x2="140" y2="70" stroke="#39E6D0" strokeWidth="1.5" opacity="0.6" />
            <line x1="140" y1="110" x2="70" y2="130" stroke="#FFC857" strokeWidth="1" opacity="0.7" />
            <line x1="140" y1="110" x2="210" y2="130" stroke="#55D68A" strokeWidth="1" opacity="0.7" />

            {/* Smart city structures (vector stylised buildings) */}
            <path d="M130 50 L150 50 L150 70 L130 70 Z" fill="#102F31" stroke="#39E6D0" strokeWidth="1.5" />
            <path d="M60 115 L80 115 L80 130 L60 130 Z" fill="#102F31" stroke="#39E6D0" strokeWidth="1" opacity="0.8" />
            <path d="M200 115 L220 115 L220 130 L200 130 Z" fill="#102F31" stroke="#39E6D0" strokeWidth="1" opacity="0.8" />

            {/* Central glowing AI Core hub */}
            <circle cx="140" cy="25" r="16" fill="url(#nodeGlow)" />
            <circle cx="140" cy="25" r="7" fill="#39E6D0" />
            <circle cx="140" cy="25" r="14" stroke="#39E6D0" strokeWidth="1" opacity="0.5" strokeDasharray="2 2" />

            {/* Active Nodes */}
            <circle cx="70" cy="130" r="4" fill="#FFC857" />
            <circle cx="210" cy="130" r="4" fill="#55D68A" />
            <circle cx="140" cy="110" r="4" fill="#39E6D0" />
            <circle cx="140" cy="170" r="3" fill="#39E6D0" opacity="0.5" />

            {/* Pulsing signal wave */}
            <circle cx="140" cy="25" r="24" stroke="#39E6D0" strokeWidth="0.75" opacity="0.3" />
          </svg>
        </div>
      </section>

      {/* ── 2. KPI Horizontal Deck ── */}
      <section className="citizen-kpi-deck">
        {/* Active */}
        <div
          className="citizen-kpi-card citizen-kpi-active"
          onClick={() => navigate('/citizen/cases', { state: { defaultFilter: 'Active' } })}
        >
          <div className="citizen-kpi-top">
            <span className="citizen-kpi-label">ACTIVE</span>
            <div className="citizen-kpi-icon-wrap">
              <Pulse size={16} weight="bold" />
            </div>
          </div>
          <div className="citizen-kpi-value">{String(activeCases.length).padStart(2, '0')}</div>
          <div className="citizen-kpi-subtext">
            <span>+{myCases.slice(0, 3).length} monitored</span>
          </div>
        </div>

        {/* In Progress */}
        <div
          className="citizen-kpi-card citizen-kpi-inprogress"
          onClick={() => navigate('/citizen/cases', { state: { defaultFilter: 'Active' } })}
        >
          <div className="citizen-kpi-top">
            <span className="citizen-kpi-label">IN PROGRESS</span>
            <div className="citizen-kpi-icon-wrap">
              <HourglassHigh size={16} weight="bold" />
            </div>
          </div>
          <div className="citizen-kpi-value">{String(inProgressCases.length).padStart(2, '0')}</div>
          <div className="citizen-kpi-subtext">
            <span>{inProgressCases.length > 0 ? 'Officer dispatched' : 'No pending actions'}</span>
          </div>
        </div>

        {/* Resolved */}
        <div
          className="citizen-kpi-card citizen-kpi-resolved"
          onClick={() => navigate('/citizen/cases', { state: { defaultFilter: 'Resolved' } })}
        >
          <div className="citizen-kpi-top">
            <span className="citizen-kpi-label">RESOLVED</span>
            <div className="citizen-kpi-icon-wrap">
              <CheckCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="citizen-kpi-value">{String(resolvedCases.length).padStart(2, '0')}</div>
          <div className="citizen-kpi-subtext">
            <span>{resolvedCases.length > 0 ? `${verificationRate}% verified` : '0 verified'}</span>
          </div>
        </div>

        {/* Overdue */}
        <div
          className="citizen-kpi-card citizen-kpi-overdue"
          onClick={() => navigate('/citizen/cases', { state: { defaultFilter: 'Active' } })}
        >
          <div className="citizen-kpi-top">
            <span className="citizen-kpi-label">OVERDUE</span>
            <div className="citizen-kpi-icon-wrap">
              <ShieldWarning size={16} weight="bold" />
            </div>
          </div>
          <div className="citizen-kpi-value">{String(overdueCases.length).padStart(2, '0')}</div>
          <div className="citizen-kpi-subtext">
            <span>{overdueCases.length > 0 ? 'Escalated to Head' : 'Within SLA target'}</span>
          </div>
        </div>

        {/* Reopened */}
        <div
          className="citizen-kpi-card citizen-kpi-reopened"
          onClick={() => navigate('/citizen/cases', { state: { defaultFilter: 'Active' } })}
        >
          <div className="citizen-kpi-top">
            <span className="citizen-kpi-label">REOPENED</span>
            <div className="citizen-kpi-icon-wrap">
              <ArrowClockwise size={16} weight="bold" />
            </div>
          </div>
          <div className="citizen-kpi-value">{String(reopenedCases.length).padStart(2, '0')}</div>
          <div className="citizen-kpi-subtext">
            <span>{reopenedCases.length > 0 ? 'Under escalation' : '0 contested'}</span>
          </div>
        </div>
      </section>

      {/* ── 3. Two-Column Layout ── */}
      <div className="citizen-grid-two-col">
        {/* Left Column: Recent Cases */}
        <div className="flex flex-col">
          <div className="citizen-section-header">
            <h3 className="citizen-section-title">
              <Clock size={18} className="text-primary" />
              Recent Cases
            </h3>
            {myCases.length > 0 && (
              <button
                type="button"
                className="citizen-section-action"
                onClick={() => navigate('/citizen/cases')}
              >
                View All Cases ({myCases.length})
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* If no cases: intentional empty state */}
          {myCases.length === 0 ? (
            <div className="citizen-empty-state-card">
              <svg className="citizen-empty-svg" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="25" width="120" height="80" rx="8" fill="#102F31" stroke="#39E6D0" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                <circle cx="80" cy="55" r="18" fill="rgba(57, 230, 208, 0.1)" stroke="#39E6D0" strokeWidth="1.5" />
                <path d="M80 47 V63 M72 55 H88" stroke="#39E6D0" strokeWidth="2" strokeLinecap="round" />
                <path d="M45 85 H115" stroke="#91B8B4" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                <path d="M55 93 H105" stroke="#91B8B4" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
              </svg>
              <h4 className="citizen-empty-title">You haven't reported any issues yet.</h4>
              <p className="citizen-empty-desc">
                Your submitted complaints and their progress will appear here. Submit your first grievance and let GovAction AI track it to resolution.
              </p>
              <button
                type="button"
                className="citizen-primary-report-btn"
                onClick={() => navigate('/citizen/report')}
              >
                <Plus size={18} weight="bold" />
                Report a Civic Issue
              </button>
            </div>
          ) : (
            <div className="citizen-case-list">
              {myCases.slice(0, 5).map(c => (
                <div
                  key={c.id}
                  className="citizen-case-row-card"
                  onClick={() => navigate(`/citizen/cases/${c.id}`)}
                >
                  {/* Top row: ID + Risk Tag */}
                  <div className="citizen-case-row-top">
                    <div className="citizen-case-id-group">
                      <span className="citizen-case-id-badge">{c.id}</span>
                      <RiskTooltip complaint={c}>
                        <span className="cursor-help">{getRiskBadge(c)}</span>
                      </RiskTooltip>
                    </div>
                    <span className="citizen-view-case-link">
                      View Case
                      <ArrowRight size={14} />
                    </span>
                  </div>

                  {/* Main row: Title + Meta + Status + Deadline */}
                  <div className="citizen-case-row-main">
                    <div className="citizen-case-title-area">
                      <h4 className="citizen-case-title">{c.title || c.issue}</h4>
                      <div className="citizen-case-meta-line">
                        <span className="citizen-case-meta-item">
                          <Buildings size={14} className="text-primary opacity-80" />
                          {c.department || 'Civic Services'}
                        </span>
                        <span className="citizen-case-meta-item">
                          <MapPin size={14} className="text-secondary opacity-80" />
                          {c.location || 'Reported Location'}
                        </span>
                        {c.assignedOfficerName && (
                          <span className="citizen-case-meta-item">
                            <UserCheck size={14} className="text-success opacity-80" />
                            {c.assignedOfficerName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="citizen-case-row-status-block">
                      <StatusBadge status={c.status} />

                      {c.expectedResolution && (
                        <div className="citizen-case-deadline-block">
                          <p className="citizen-deadline-label">Deadline</p>
                          <p className="citizen-deadline-date">{c.expectedResolution}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Resolution Activity & Upcoming Deadlines */}
        <aside className="citizen-sidebar-panel">
          {/* Action Required Banner if cases are resolved awaiting citizen verification */}
          {verificationNeeded.length > 0 && (
            <div
              className="citizen-action-needed-card"
              onClick={() => navigate(`/citizen/cases/${verificationNeeded[0].id}`)}
            >
              <div className="flex items-center gap-2 mb-1.5 text-warning font-bold text-xs uppercase tracking-wider">
                <WarningCircle size={18} weight="fill" className="animate-pulse" />
                Verification Required
              </div>
              <p className="text-xs text-text-primary m-0 font-medium">
                {verificationNeeded.length} resolved case(s) waiting for your sign-off at location.
              </p>
              <div className="mt-2 text-[11px] text-warning font-bold flex items-center gap-1">
                Inspect and Verify Now →
              </div>
            </div>
          )}

          {/* Resolution Activity Timeline */}
          <div className="citizen-panel-card">
            <div className="citizen-panel-header">
              <ChartLineUp size={16} className="text-primary" />
              <span>Resolution Activity</span>
            </div>

            {latestTrackedCase ? (
              <div>
                <div className="mb-3">
                  <span className="text-[10px] font-mono text-primary bg-primary bg-opacity-10 px-2 py-0.5 rounded border border-primary border-opacity-20">
                    {latestTrackedCase.id}
                  </span>
                  <p className="text-xs font-bold text-white m-0 mt-1 truncate">
                    {latestTrackedCase.title || latestTrackedCase.issue}
                  </p>
                </div>

                <div className="citizen-milestone-track">
                  {/* Submitted */}
                  <div className="citizen-milestone-item done">
                    <div className="citizen-milestone-dot">●</div>
                    <p className="citizen-milestone-title">Submitted</p>
                    <p className="citizen-milestone-desc">Registered by GovAction AI</p>
                  </div>

                  {/* Assigned */}
                  <div className={`citizen-milestone-item ${latestTrackedCase.assignedOfficerName ? 'done' : 'active'}`}>
                    <div className="citizen-milestone-dot">●</div>
                    <p className="citizen-milestone-title">Assigned</p>
                    <p className="citizen-milestone-desc">
                      {latestTrackedCase.assignedOfficerName
                        ? `Officer: ${latestTrackedCase.assignedOfficerName}`
                        : 'Auto-routing to department'}
                    </p>
                  </div>

                  {/* In Progress */}
                  <div className={`citizen-milestone-item ${latestTrackedCase.status === 'In Progress' || latestTrackedCase.status === 'Resolved' || latestTrackedCase.status === 'Solved' ? 'done' : ''}`}>
                    <div className="citizen-milestone-dot">●</div>
                    <p className="citizen-milestone-title">In Progress</p>
                    <p className="citizen-milestone-desc">Field team operation active</p>
                  </div>

                  {/* Verification */}
                  <div className={`citizen-milestone-item ${latestTrackedCase.status === 'Solved' ? 'done' : latestTrackedCase.status === 'Resolved' ? 'active' : ''}`}>
                    <div className="citizen-milestone-dot">○</div>
                    <p className="citizen-milestone-title">Verification</p>
                    <p className="citizen-milestone-desc">Citizen on-site inspection</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-secondary text-center py-4 italic m-0">
                Submit an issue to track live resolution milestones.
              </p>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className="citizen-panel-card">
            <div className="citizen-panel-header">
              <CalendarBlank size={16} className="text-primary" />
              <span>Upcoming Deadlines</span>
            </div>

            {casesWithDeadlines.length === 0 ? (
              <p className="text-xs text-secondary text-center py-3 m-0 opacity-70">
                No active deadlines scheduled.
              </p>
            ) : (
              <div className="citizen-deadline-list">
                {casesWithDeadlines.map(c => {
                  const parts = c.expectedResolution ? c.expectedResolution.split(' ') : ['24', 'Hours'];
                  const day = parts[0] || '18';
                  const month = parts[1] || 'SEP';

                  return (
                    <div
                      key={c.id}
                      className="citizen-deadline-item"
                      onClick={() => navigate(`/citizen/cases/${c.id}`)}
                    >
                      <div className="citizen-deadline-badge">
                        <div className="citizen-deadline-badge-day">{day}</div>
                        <div className="citizen-deadline-badge-month">{month}</div>
                      </div>
                      <div className="citizen-deadline-info">
                        <h5 className="citizen-deadline-name">{c.title || c.issue}</h5>
                        <p className="citizen-deadline-dept">{c.department}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
