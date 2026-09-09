import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  IdentificationCard,
  Buildings,
  Crown,
  ArrowRight,
} from '@phosphor-icons/react';
import AuthBackground from './AuthBackground';

const roles = [
  {
    id: 'citizen',
    number: '01',
    title: 'CITIZEN',
    portal: 'Citizen Services Portal',
    description: 'Report civic issues, track complaints and verify resolutions.',
    details: ['Submit civic complaints', 'Track case progress', 'Verify resolutions'],
    icon: User,
    route: '/auth/citizen',
    color: 'var(--primary)',
    colorRgb: '57, 230, 208',
  },
  {
    id: 'officer',
    number: '02',
    title: 'FIELD OFFICER',
    portal: 'Field Operations Portal',
    description: 'Manage assigned cases, update progress and complete field actions.',
    details: ['Manage assigned cases', 'Update field progress', 'Complete action items'],
    icon: IdentificationCard,
    route: '/auth/officer',
    color: 'var(--secondary)',
    colorRgb: '255, 200, 87',
  },
  {
    id: 'department_head',
    number: '03',
    title: 'DEPARTMENT HEAD',
    portal: 'Department Command Portal',
    description: 'Manage departmental cases, officers, escalations and performance.',
    details: ['Departmental case overview', 'Officer management', 'Escalation control'],
    icon: Buildings,
    route: '/auth/department-head',
    color: 'var(--critical)',
    colorRgb: '255, 107, 107',
  },
  {
    id: 'district_collector',
    number: '04',
    title: 'DISTRICT COLLECTOR',
    portal: 'District Command Center',
    description: 'Monitor district governance, high-risk cases, escalations and compliance.',
    details: ['District-wide oversight', 'High-risk case monitoring', 'Governance compliance'],
    icon: Crown,
    route: '/auth/collector',
    color: 'var(--success)',
    colorRgb: '85, 214, 138',
  },
];

function RoleCard({ role }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const Icon = role.icon;

  return (
    <div
      className="role-card"
      style={{
        '--role-color': role.color,
        '--role-color-rgb': role.colorRgb,
        borderColor: hovered ? role.color : 'rgba(145,184,180,0.15)',
        boxShadow: hovered
          ? `0 20px 48px rgba(0,0,0,0.4), 0 0 24px rgba(${role.colorRgb}, 0.15)`
          : '0 4px 16px rgba(0,0,0,0.2)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(role.route)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(role.route)}
      aria-label={`Continue as ${role.title}`}
    >
      {/* Number badge */}
      <div className="role-card-number" style={{ color: role.color }}>
        {role.number}
      </div>

      {/* Icon + title row */}
      <div className="role-card-header">
        <div
          className="role-card-icon"
          style={{
            background: `rgba(${role.colorRgb}, 0.1)`,
            borderColor: `rgba(${role.colorRgb}, 0.3)`,
            transform: hovered ? 'scale(1.12) rotate(-4deg)' : 'scale(1) rotate(0deg)',
          }}
        >
          <Icon size={28} weight="fill" style={{ color: role.color }} />
        </div>

        <div className="role-card-arrow" style={{ transform: hovered ? 'translateX(6px)' : 'translateX(0)', color: role.color }}>
          <ArrowRight size={20} weight="bold" />
        </div>
      </div>

      {/* Text */}
      <h3 className="role-card-title" style={{ color: role.color }}>{role.title}</h3>
      <p className="role-card-portal">{role.portal}</p>
      <p className="role-card-desc">{role.description}</p>

      {/* Expanded details on hover */}
      <div
        className="role-card-details"
        style={{
          maxHeight: hovered ? '120px' : '0',
          opacity: hovered ? 1 : 0,
        }}
      >
        <div
          className="role-card-divider"
          style={{ borderColor: `rgba(${role.colorRgb}, 0.2)` }}
        />
        {role.details.map((d, i) => (
          <div key={i} className="role-card-detail-item" style={{ color: role.color }}>
            <span className="role-card-dot" style={{ background: role.color }} />
            {d}
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        className="role-card-btn"
        style={{
          borderColor: `rgba(${role.colorRgb}, 0.4)`,
          color: role.color,
          background: hovered ? `rgba(${role.colorRgb}, 0.1)` : 'transparent',
        }}
        tabIndex={-1}
      >
        Continue as {role.title.split(' ')[0]} →
      </button>
    </div>
  );
}

export default function PortalSelection() {
  return (
    <AuthBackground>
      <div className="portal-selection-wrapper">
        <div className="portal-selection-hero">
          <h1 className="portal-selection-title">Welcome to GovAction AI</h1>
          <p className="portal-selection-sub">Secure Civic Governance Access</p>
          <p className="portal-selection-hint">Select your role to continue to your portal</p>
        </div>

        <div className="role-cards-grid">
          {roles.map(role => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>
      </div>
    </AuthBackground>
  );
}
